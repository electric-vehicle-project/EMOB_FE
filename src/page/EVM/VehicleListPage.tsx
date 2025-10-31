/* EMOB-2025 - VehicleListPage (Quản lý mẫu xe, đồng bộ UI quản lý) */
import { useMemo, useState } from "react";
import { Empty, Input, Pagination, Row, Col, Spin } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Role } from "../../model/Account";
import type { ElectricVehicle } from "../../model/ElectricVehicle";
import { getRoleBasePath } from "../../utils/roleGuard";
import { useGetVehicles } from "../../service/vehicleService";
import { VehicleCard } from "../../components/organisms/vehicle/VehicleCard";
import { ROUTES } from "../../model/routePaths";
import CardWrapper from "../../components/template/CardWrapper";
import { Button } from "../../components/atoms/Button";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const VehicleListPage = () => {
  const navigate = useNavigate();

  // --- Lấy role chắc chắn (Redux + fallback từ token/localStorage)
  type RootLike = { auth?: { user?: { role?: Role | null } } };
  const reduxRole = useSelector<RootLike, Role | null | undefined>(
    (s) => s.auth?.user?.role
  );
  const tokenRole = (useCurrentUser() as { role?: Role } | null)?.role;
  const role = (reduxRole ?? tokenRole ?? null) as Role | null;

  const allowCreate = role === "EVM_STAFF"; // chỉ EVM_STAFF mới được tạo mẫu xe
  const basePath = getRoleBasePath(role ?? null);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [q, setQ] = useState("");

  // ✅ Gọi API chuẩn hoá
  const { vehicles, metadata, isLoading } = useGetVehicles({
    page: page - 1,
    size,
    keyword: q.trim() || undefined,
    sortField: "createdAt",
    sortDir: "desc",
  });

  // ✅ unwrap dữ liệu
  const items = (vehicles as ElectricVehicle[]) || [];
  const total = metadata?.totalElements ?? items.length ?? 0;

  // 🔍 Tìm kiếm (bên trái, bề rộng gọn – responsive)
  const searchBox = useMemo(
    () => (
      <div className="w-full max-w-[340px] md:max-w-[420px]">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, hãng..."
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="rounded-lg"
        />
      </div>
    ),
    []
  );

  // ➕ Nút thêm (bên phải, đồng bộ atoms/Button)
  const addButton = useMemo(
    () =>
      allowCreate ? (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="rounded-md !bg-[#627254] !border-[#627254] hover:!bg-[#76885B]"
          onClick={() => navigate(`${basePath}/${ROUTES.EVM_VEHICLE_NEW}`)}
        >
          Thêm mẫu xe
        </Button>
      ) : (
        <div /> // giữ layout cân hai đầu khi ẩn nút
      ),
    [allowCreate, navigate, basePath]
  );

  return (
    <CardWrapper
      title="Quản lí mẫu xe"
      subtitle="Danh sách toàn bộ các mẫu xe điện trong hệ thống"
      variant="dashboard"
    >
      {/* Header: trái là search (ngắn gọn), phải là nút thêm */}
      <div className="flex items-center justify-between mb-5 gap-3">
        {searchBox}
        {addButton}
      </div>

      {/* Nội dung */}
      <Spin spinning={isLoading}>
        {items.length === 0 ? (
          <Empty
            description="Không có dữ liệu"
            className="bg-white rounded-xl py-10"
          />
        ) : (
          <>
            {/* Grid xe */}
            <div className="px-1 sm:px-2 md:px-3">
              <Row gutter={[20, 20]}>
                {items.map((v) => (
                  <Col key={v.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <VehicleCard
                      vehicle={{
                        id: v.id,
                        name: `${(v as any).brand ?? ""} ${
                          (v as any).model ?? ""
                        }`.trim(),
                        brand: (v as any).brand,
                        imageUrl:
                          (v as any).imageUrl ||
                          (Array.isArray((v as any).images) &&
                          (v as any).images.length > 0
                            ? (v as any).images[0]
                            : "https://placehold.co/300x200?text=No+Image"),
                        basePrice:
                          (v as any).retailPrice ??
                          (v as any).importPrice ??
                          undefined,
                        batteryCapacity: (v as any).batteryKwh,
                        rangePerCharge: (v as any).rangeKm,
                        power: (v as any).powerKw,
                      }}
                      onOpenDetail={(id) =>
                        navigate(
                          `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(
                            ":id",
                            id
                          )
                        )
                      }
                      onViewUnits={(id) =>
                        navigate(
                          `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(
                            ":id",
                            id
                          ) + "?openUnits=1"
                        )
                      }
                    />
                  </Col>
                ))}
              </Row>
            </div>

            {/* ✅ Phân trang giữa dưới */}
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
