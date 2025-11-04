import { Row, Col, Empty, Spin, Input } from "antd";
import { useMemo, useState } from "react";
import type { FC } from "react";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { useGetVehicles } from "../../../service/vehicleService";
import { VehicleCard } from "./VehicleCard";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../model/routePaths";
import type { ElectricVehicle } from "../../../model/ElectricVehicle";
import type { IVehicle } from "../../../model/Vehicle";
import { getRoleBasePath } from "../../../utils/roleGuard";

type Props = { onOpenUnits?: (id: string) => void };

export const VehicleList: FC<Props> = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const user = useCurrentUser();
  const basePath = useMemo(() => getRoleBasePath(user), [user]);

  // Dùng API có params đúng swagger
  const { vehicles: apiVehicles, isLoading } = useGetVehicles(
    { keyword: q.trim() || undefined, size: 100 },
    { keepPreviousData: true }
  );

  const vehicles: IVehicle[] = useMemo(
    () =>
      Array.isArray(apiVehicles) ? (apiVehicles as unknown as IVehicle[]) : [],
    [apiVehicles]
  );

  const safeVehicles = useMemo(
    () =>
      vehicles.filter(
        (v): v is IVehicle & { id: string } =>
          typeof v?.id === "string" && v.id.length > 0
      ),
    [vehicles]
  );

  const mapToElectric = (v: IVehicle & { id: string }): ElectricVehicle => ({
    id: v.id,
    name: `${v.brand ?? ""} ${v.model ?? ""}`.trim(),
    brand: v.brand,
    imageUrl:
      Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : undefined,
    basePrice: typeof v.retailPrice === "number" ? v.retailPrice : undefined, // ưu tiên retail
    batteryCapacity: v.batteryKwh,
    rangePerCharge: v.rangeKm,
    power: v.powerKw,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input.Search
        placeholder="Tìm kiếm theo hãng, mẫu, loại, hoặc mã xe…"
        allowClear
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ maxWidth: 420 }}
      />

      {safeVehicles.length === 0 ? (
        <Empty description="Không tìm thấy xe phù hợp" />
      ) : (
        <Row gutter={[16, 16]}>
          {safeVehicles.map((v) => (
            <Col xs={24} sm={12} md={8} lg={6} key={v.id}>
              <VehicleCard
                vehicle={mapToElectric(v)}
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
      )}
    </div>
  );
};
