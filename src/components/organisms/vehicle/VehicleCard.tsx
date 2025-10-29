// src/components/organisms/vehicle/VehicleCard.tsx
import { Card, Tag, Button } from "antd";
import { EyeOutlined, AppstoreOutlined } from "@ant-design/icons";
import type { ElectricVehicle } from "../../../model/ElectricVehicle";

interface Props {
  vehicle: ElectricVehicle;
  onOpenDetail: (id: string) => void;
  onViewUnits?: (id: string) => void; // xem lô xe
}

export const VehicleCard = ({ vehicle, onOpenDetail, onViewUnits }: Props) => {
  const cover = (
    <div className="w-full h-44 overflow-hidden flex items-center justify-center bg-neutral-50">
      {/* hình kiểu cellphones/shopee */}
      <img
        src={vehicle.imageUrl || "/images/vehicle-placeholder.png"}
        alt={vehicle.name}
        className="object-contain h-full"
      />
    </div>
  );

  return (
    <Card
      hoverable
      className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
      cover={cover}
      onClick={() => onOpenDetail(vehicle.id)}
    >
      <div className="space-y-2">
        <div className="font-semibold text-base line-clamp-1">
          {vehicle.name}
        </div>
        <div className="text-xs text-neutral-500">{vehicle.brand}</div>

        <div className="flex flex-wrap gap-2 my-1">
          {vehicle.rangePerCharge != null && (
            <Tag className="rounded-full">
              Tầm hoạt động: {vehicle.rangePerCharge} km
            </Tag>
          )}
          {vehicle.batteryCapacity != null && (
            <Tag className="rounded-full">
              Pin: {vehicle.batteryCapacity} kWh
            </Tag>
          )}
          {vehicle.power != null && (
            <Tag className="rounded-full">Công suất: {vehicle.power} kW</Tag>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="font-bold text-lg">
            {vehicle.basePrice
              ? vehicle.basePrice.toLocaleString("vi-VN") + " ₫"
              : "Liên hệ"}
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              icon={<AppstoreOutlined />}
              onClick={() => onViewUnits?.(vehicle.id)}
            >
              Xem lô xe
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => onOpenDetail(vehicle.id)}
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
