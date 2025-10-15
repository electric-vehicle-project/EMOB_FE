export interface IVehicle {
  id: string;
  brand: string;
  model: string;
  importPrice: number;
  retailPrice: number;
  batteryKwh: number;
  rangeKm: number;
  chargeTimeHr: number;
  powerKw: number;
  images: string[];
  weightKg: number;
  topSpeedKmh: number;
  type: "SEDAN" | "SUV" | "MOTORBIKE" | "TRUCK" | "OTHER";
  createdAt: string;
}
