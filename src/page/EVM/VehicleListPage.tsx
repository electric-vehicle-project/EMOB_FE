/* EMOB-2025 - VehicleListPage (card grid giống Shopee/Cellphones) */
import { useMemo, useState } from "react";
import { Button, Empty, Input, Pagination, Row, Col, Spin } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Role } from "../../model/Account";
import type { ElectricVehicle } from "../../model/ElectricVehicle";
import { canCreateVehicle, getRoleBasePath } from "../../utils/roleGuard";
import { useGetVehicles } from "../../service/vehicleService";
import { VehicleCard } from "../../components/organisms/vehicle/VehicleCard";
import { ROUTES } from "../../model/routePaths";

export const VehicleListPage = () => {
  const navigate = useNavigate();
  type RootLike = { auth?: { user?: { role?: Role | null } } };
  const role = useSelector<RootLike, Role | null | undefined>(
    (s) => s.auth?.user?.role
  );
  const allowCreate = canCreateVehicle(role);
  const basePath = getRoleBasePath(role ?? null);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [q, setQ] = useState("");

  const { data, isLoading } = useGetVehicles(
    { page: page - 1, size, keyword: q.trim() || undefined },
    { keepPreviousData: true }
  );

  const items =
    (data as { content?: ElectricVehicle[] } | undefined)?.content ?? [];
  const total =
    (data as { totalElements?: number } | undefined)?.totalElements ?? 0;

  const headerRight = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, hãng..."
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="w-72"
        />
        {allowCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${basePath}/${ROUTES.EVM_VEHICLE_NEW}`)}
          >
            Thêm xe mới
          </Button>
        )}
      </div>
    ),
    [allowCreate, navigate, basePath]
  );

  return (
    <div className="p-4 lg:p-6">
      {/* Page Controller Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quản lí mẫu xe</h1>
        {headerRight}
      </div>

      {/* Grid content */}
      <Spin spinning={isLoading}>
        {items.length === 0 ? (
          <Empty
            description="Không có dữ liệu"
            className="bg-white rounded-xl py-10"
          />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {items.map((v) => (
                <Col key={v.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <VehicleCard
                    vehicle={v}
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
            <div className="flex justify-end mt-4">
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
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};
