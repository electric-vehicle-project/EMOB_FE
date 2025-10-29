// src/components/organisms/EVM/VehicleList.tsx
import { Row, Col, Empty, Spin } from "antd";
import { useMemo } from "react";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { useGetVehicles } from "../../../service/vehicleService";
import { VehicleCard } from "../../molecules/EVM/VehicleCard";
import type { IVehicle } from "../../../model/Vehicle";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../model/routePaths";

type Props = {
  onOpenUnits?: (id: string) => void;
};

export const VehicleList = ({ onOpenUnits }: Props) => {
  // Lấy role hiện tại
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  // Tính basePath ổn định (tránh re-render không cần thiết)
  const basePath = useMemo<
    "/admin" | "/evm_staff" | "/manager" | "/dealer_staff"
  >(
    () =>
      role === "ADMIN"
        ? "/admin"
        : role === "EVM_STAFF"
        ? "/evm_staff"
        : role === "MANAGER"
        ? "/manager"
        : "/dealer_staff",
    [role]
  );

  const navigate = useNavigate();

  // Lấy danh sách xe
  const { data, isLoading } = useGetVehicles();

  // Chuẩn hóa dữ liệu từ nhiều shape khác nhau (array | {result:{data}} | {result})
  const vehicles: IVehicle[] = useMemo(() => {
    const raw = (data?.result?.data ?? data?.result ?? data) as unknown;
    if (Array.isArray(raw)) return raw as IVehicle[];
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.data as unknown[])) {
        return obj.data as IVehicle[];
      }
    }
    return [];
  }, [data]);

  // Lọc phần tử không hợp lệ (thiếu id)
  const safeVehicles = useMemo(
    () =>
      vehicles.filter(
        (v): v is IVehicle & { id: string } =>
          typeof v?.id === "string" && v.id.length > 0
      ),
    [vehicles]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  if (!safeVehicles.length) {
    return <Empty description="Chưa có xe nào" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {safeVehicles.map((v) => (
        <Col xs={24} sm={12} md={8} lg={6} key={v.id}>
          <VehicleCard
            vehicle={v}
            onViewDetail={() =>
              navigate(
                `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", v.id)
              )
            }
            onViewUnits={onOpenUnits}
          />
        </Col>
      ))}
    </Row>
  );
};
