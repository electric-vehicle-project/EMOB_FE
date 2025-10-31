import { Row, Col, Empty, Spin, Input } from "antd";
import { useMemo, useState } from "react";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { useGetVehicles } from "../../../service/vehicleService";
import { VehicleCard } from "./VehicleCard";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../model/routePaths";
import type { ElectricVehicle } from "../../../model/ElectricVehicle";
import type { IVehicle } from "../../../model/Vehicle";

type Props = { onOpenUnits?: (id: string) => void };

export const VehicleList = ({ onOpenUnits }: Props) => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

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

  const { data, isLoading } = useGetVehicles();

  const vehicles: IVehicle[] = useMemo(() => {
    const apiData = data as unknown as
      | { result?: unknown; data?: unknown }
      | undefined;
    const raw =
      (apiData?.result as { data?: unknown } | undefined)?.data ??
      apiData?.result ??
      apiData;
    if (Array.isArray(raw)) return raw as IVehicle[];
    if (raw && typeof raw === "object") {
      const obj = raw as { data?: unknown };
      if (Array.isArray(obj.data)) return (obj.data as IVehicle[]) ?? [];
    }
    return [];
  }, [data]);

  const safeVehicles = useMemo(
    () =>
      vehicles.filter(
        (v): v is IVehicle & { id: string } =>
          typeof v?.id === "string" && v.id.length > 0
      ),
    [vehicles]
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return safeVehicles;
    const s = q.trim().toLowerCase();
    return safeVehicles.filter((v) => {
      const brand = (v.brand ?? "").toString().toLowerCase();
      const model = (v.model ?? "").toString().toLowerCase();
      const type = (v.type ?? "").toString().toLowerCase();
      const id = (v.id ?? "").toString().toLowerCase();
      return (
        brand.includes(s) ||
        model.includes(s) ||
        type.includes(s) ||
        id.includes(s)
      );
    });
  }, [safeVehicles, q]);

  const mapToElectric = (v: IVehicle & { id: string }): ElectricVehicle => ({
    id: v.id,
    name: `${v.brand ?? ""} ${v.model ?? ""}`.trim(),
    brand: v.brand,
    imageUrl:
      Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : undefined,
    basePrice: v.retailPrice ?? v.importPrice,
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

      {filtered.length === 0 ? (
        <Empty description="Không tìm thấy xe phù hợp" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((v) => (
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
