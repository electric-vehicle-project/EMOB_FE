// src/components/organisms/vehicle/VehicleCard.tsx
import React, { type KeyboardEvent } from "react";
import { Card, Tag, Tooltip } from "antd";
import type { ElectricVehicle } from "../../../model/ElectricVehicle";

interface Props {
  vehicle: ElectricVehicle;
  onOpenDetail: (id: string) => void;
}

const fmtPrice = (v?: number) =>
  typeof v === "number" && v > 0 ? `${v.toLocaleString("vi-VN")} ₫` : undefined;

export const VehicleCard: React.FC<Props> = ({ vehicle, onOpenDetail }) => {
  const priceText = fmtPrice(vehicle.basePrice);

  // chuẩn hoá KPI: chỉ lấy tối đa 3 chỉ số quan trọng
  const kpis: React.ReactNode[] = [];
  if (typeof vehicle.rangePerCharge === "number") {
    kpis.push(
      <Tag key="range" className="rounded-md">
        Tầm: {vehicle.rangePerCharge} km
      </Tag>
    );
  }
  if (typeof vehicle.batteryCapacity === "number") {
    kpis.push(
      <Tag key="bat" className="rounded-md">
        Pin: {vehicle.batteryCapacity} kWh
      </Tag>
    );
  }
  if (typeof vehicle.power === "number") {
    kpis.push(
      <Tag key="pow" className="rounded-md">
        Công suất: {vehicle.power} kW
      </Tag>
    );
  }
  const shownKpis = kpis.slice(0, 3);

  const handleActivate = () => onOpenDetail(vehicle.id);
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  };

  const cover = (
    <div className="relative w-full h-44 overflow-hidden flex items-center justify-center bg-neutral-50">
      <img
        src={vehicle.imageUrl || "/images/vehicle-placeholder.png"}
        alt={vehicle.name}
        className="object-contain h-full"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "/images/vehicle-placeholder.png";
        }}
      />

      {/* Badge giá / trạng thái định giá */}
      <div className="absolute top-2 right-2">
        {priceText ? (
          <div className="px-2.5 py-1 rounded-full bg-white/90 border border-gray-200 text-xs font-semibold">
            {priceText}
          </div>
        ) : (
          <Tooltip title="Admin chưa cập nhật giá">
            <div className="px-2.5 py-1 rounded-full bg-amber-50/95 border border-amber-200 text-[11px] font-medium text-amber-700">
              Chưa định giá
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <Card
      hoverable
      cover={cover}
      bodyStyle={{ padding: 16 }}
      className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer"
      onClick={handleActivate}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Xem chi tiết ${vehicle.name}`}
        onKeyDown={handleKey}
        className="outline-none"
      >
        {/* Tiêu đề + brand */}
        <div className="min-h-[40px]">
          <Tooltip title={vehicle.name}>
            <h3 className="font-semibold text-base text-[#414d38] line-clamp-1">
              {vehicle.name}
            </h3>
          </Tooltip>
          {vehicle.brand && (
            <div className="text-xs text-neutral-500 line-clamp-1">
              {vehicle.brand}
            </div>
          )}
        </div>

        {/* Loại + các KPI chính */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Tag className="rounded-md">{(vehicle as any)?.type ?? "EV"}</Tag>
          {shownKpis}
        </div>
      </div>
    </Card>
  );
};

export default VehicleCard;
