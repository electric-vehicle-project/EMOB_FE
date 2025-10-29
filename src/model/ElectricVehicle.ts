// src/model/ElectricVehicle.ts
export interface ElectricVehicle {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  basePrice?: number;
  batteryCapacity?: number; // kWh
  rangePerCharge?: number; // km
  power?: number; // kW
  torque?: number; // Nm
  seats?: number;
  // ...bạn có thể bổ sung các field khác có trong BE
}

export type CompareBetter = "left" | "right" | null;

export interface VehicleComparisonField {
  key: string; // e.g. "basePrice"
  label: string; // e.g. "Giá niêm yết"
  left: string | number | null;
  right: string | number | null;
  different: boolean;
  betterFor?: CompareBetter; // BE trả "left" hoặc "right" nếu có
}

export interface VehicleComparisonResponse {
  left: ElectricVehicle;
  right: ElectricVehicle;
  fields: VehicleComparisonField[];
}
