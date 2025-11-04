/* EMOB-2025 - VehicleListPage (realtime search w/ debounce + queryKey override) */
import { useMemo, useState, useEffect } from "react";
import { Empty, Input, Pagination, Row, Col, Spin } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Role } from "../../model/Account";
import type { IVehicle } from "../../model/Vehicle";
import { getRoleBasePath } from "../../utils/roleGuard";
import { useGetVehicles } from "../../service/vehicleService";
import { VehicleCard } from "../../components/organisms/vehicle/VehicleCard";
import { ROUTES } from "../../model/routePaths";
import CardWrapper from "../../components/template/CardWrapper";
import { Button } from "../../components/atoms/Button";
import { useCurrentUser } from "../../utils/getCurrentUser";

/** Small debounce hook (no external deps) */
function useDebounce<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export const VehicleListPage = () => {
  const navigate = useNavigate();

  type RootLike = { auth?: { user?: { role?: Role | null } } };
  const reduxRole = useSelector<RootLike, Role | null | undefined>(
    (s) => s.auth?.user?.role
  );
  const tokenRole = (useCurrentUser() as { role?: Role } | null)?.role;
  const role = (reduxRole ?? tokenRole ?? null) as Role | null;

  const allowCreate = role === "EVM_STAFF";
  const basePath = getRoleBasePath(role ?? null);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [q, setQ] = useState("");

  // ✅ Debounce keyword để “realtime” mượt mà, hạn chế spam request
  const debouncedQ = useDebounce(q, 350);

  // ✅ Gọi API: truyền keyword + override queryKey để refetch khi q/page/size đổi
  const { vehicles, metadata, isLoading } = useGetVehicles(
    {
      page: page - 1,
      size,
      keyword: debouncedQ.trim() || undefined,
      sortField: "createdAt",
      sortDir: "desc",
    },
    {
      keepPreviousData: true,
      // Quan trọng: override queryKey để React Query biết khi nào refetch
      queryKey: ["get-vehicles", page, size, debouncedQ.trim()],
    }
  );

  const items = useMemo(
    () => (Array.isArray(vehicles) ? (vehicles as IVehicle[]) : []),
    [vehicles]
  );

  const safeItems = useMemo(
    () =>
      items.filter(
        (v): v is IVehicle & { id: string } =>
          typeof v.id === "string" && v.id.length > 0
      ),
    [items]
  );

  const total = metadata?.totalElements ?? items.length ?? 0;

  const searchBox = (
    <div className="w-full max-w-[340px] md:max-w-[420px]">
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Tìm theo tên, hãng..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1); // reset trang khi đổi keyword
        }}
        onPressEnter={() => {
          // optional: ép về trang 1 khi Enter
          setPage(1);
        }}
        className="rounded-lg"
      />
    </div>
  );

  const addButton = allowCreate ? (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      className="rounded-md !bg-[#627254] !border-[#627254] hover:!bg-[#76885B]"
      onClick={() => navigate(`${basePath}/${ROUTES.EVM_VEHICLE_NEW}`)}
    >
      Thêm mẫu xe
    </Button>
  ) : (
    <div />
  );

  return (
    <CardWrapper
      title="Quản lí mẫu xe"
      subtitle="Danh sách toàn bộ các mẫu xe điện trong hệ thống"
      variant="dashboard"
    >
      <div className="flex items-center justify-between mb-5 gap-3">
        {searchBox}
        {addButton}
      </div>

      <Spin spinning={isLoading}>
        {items.length === 0 ? (
          <Empty
            description={
              debouncedQ.trim()
                ? `Không tìm thấy kết quả cho "${debouncedQ.trim()}"`
                : "Không có dữ liệu"
            }
            className="bg-white rounded-xl py-10"
          />
        ) : (
          <>
            <div className="px-1 sm:px-2 md:px-3">
              <Row gutter={[20, 20]}>
                {safeItems.map((v) => (
                  <Col key={v.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <VehicleCard
                      vehicle={{
                        id: v.id,
                        name: `${v.brand ?? ""} ${v.model ?? ""}`.trim(),
                        brand: v.brand,
                        imageUrl:
                          Array.isArray(v.images) && v.images.length > 0
                            ? v.images[0]
                            : "https://placehold.co/300x200?text=No+Image",
                        basePrice:
                          typeof v.retailPrice === "number"
                            ? v.retailPrice
                            : undefined,
                        batteryCapacity: v.batteryKwh,
                        rangePerCharge: v.rangeKm,
                        power: v.powerKw,
                        type: v.type,
                      }}
                      onOpenDetail={(id) =>
                        navigate(
                          `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(
                            ":id",
                            id
                          )
                        )
                      }
                    />
                  </Col>
                ))}
              </Row>
            </div>

            <div className="flex justify-center mt-8">
              <Pagination
                current={page}
                pageSize={size}
                total={total}
                showSizeChanger
                onChange={(p, ps) => {
                  setPage(p);
                  setSize(ps);
                }}
                showTotal={(t) => `${t} mẫu xe`}
                className="text-[#627254]"
              />
            </div>
          </>
        )}
      </Spin>
    </CardWrapper>
  );
};

export default VehicleListPage;
