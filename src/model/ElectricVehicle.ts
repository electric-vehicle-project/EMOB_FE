// src/model/ElectricVehicle.ts
export interface ElectricVehicle {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  basePrice?: number; // ưu tiên retail
  batteryCapacity?: number; // kWh
  rangePerCharge?: number; // km
  power?: number; // kW
  torque?: number; // Nm
  seats?: number;
  type?: string;
}

export type CompareBetter = "left" | "right" | null;

export interface VehicleComparisonField {
  key: string;
  label: string;
  left: string | number | null;
  right: string | number | null;
  different: boolean;
  betterFor?: CompareBetter;
}

export interface VehicleComparisonResponse {
  left: ElectricVehicle;
  right: ElectricVehicle;
  fields: VehicleComparisonField[];
}
