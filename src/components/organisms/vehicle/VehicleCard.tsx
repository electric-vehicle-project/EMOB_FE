import React, { type KeyboardEvent } from "react";
import { Card, Tag, Tooltip } from "antd";
import type { ElectricVehicle } from "../../../model/ElectricVehicle";

interface Props {
  vehicle: ElectricVehicle;
  onOpenDetail: (id: string) => void;
  onViewUnits?: (id: string) => void;
}

const fmtPrice = (v?: number) =>
  typeof v === "number" && v > 0 ? `${v.toLocaleString("vi-VN")} ₫` : undefined;

export const VehicleCard: React.FC<Props> = ({ vehicle, onOpenDetail }) => {
  const priceText = fmtPrice(vehicle.basePrice);

  const kpis: React.ReactNode[] = [];
  if (typeof vehicle.rangePerCharge === "number") {
    kpis.push(
      <Tag key="range" className="rounded-full text-xs px-2 py-0.5">
        Tầm: {vehicle.rangePerCharge.toLocaleString("vi-VN")} km
      </Tag>
    );
  }
  if (typeof vehicle.batteryCapacity === "number") {
    kpis.push(
      <Tag key="bat" className="rounded-full text-xs px-2 py-0.5">
        Pin: {vehicle.batteryCapacity.toLocaleString("vi-VN")} kWh
      </Tag>
    );
  }
  if (typeof vehicle.power === "number") {
    kpis.push(
      <Tag key="pow" className="rounded-full text-xs px-2 py-0.5">
        Công suất: {vehicle.power.toLocaleString("vi-VN")} kW
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
    <div className="relative w-full h-44 overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#f5f7f0] to-white">
      <img
        src={vehicle.imageUrl || "/images/vehicle-placeholder.png"}
        alt={vehicle.name}
        className="object-contain h-full transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "/images/vehicle-placeholder.png";
        }}
      />

      {/* Badge loại xe */}
      <div className="absolute left-2 top-2">
        <Tag className="rounded-full text-[11px] px-2 py-0.5 bg-white/90 border border-gray-200">
          {vehicle.type ?? "EV"}
        </Tag>
      </div>

      {/* Giá / Chưa định giá */}
      <div className="absolute right-2 top-2">
        {priceText ? (
          <div className="px-2.5 py-1 rounded-full bg-[#ecf4ea] border border-[#c9e0c3] text-[11px] font-semibold text-[#365326] shadow-sm">
            {priceText}
          </div>
        ) : (
          <Tooltip title="Admin chưa cập nhật giá">
            <div className="px-2.5 py-1 rounded-full bg-amber-50/95 border border-amber-200 text-[11px] font-medium text-amber-700 shadow-sm">
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
      bodyStyle={{ padding: 14 }}
      className="group rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-white"
      onClick={handleActivate}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Xem chi tiết ${vehicle.name}`}
        onKeyDown={handleKey}
        className="outline-none"
      >
        {/* Tên + hãng */}
        <div className="min-h-[44px] mb-1">
          <Tooltip title={vehicle.name}>
            <h3 className="font-semibold text-[15px] text-[#1f2933] leading-snug line-clamp-1">
              {vehicle.name}
            </h3>
          </Tooltip>
          {vehicle.brand && (
            <div className="text-[12px] text-neutral-500 line-clamp-1">
              {vehicle.brand}
            </div>
          )}
        </div>

        {/* Thông số nhanh */}
        <div className="flex flex-wrap gap-1.5 mt-2">{shownKpis}</div>
      </div>
    </Card>
  );
};

export default VehicleCard;
