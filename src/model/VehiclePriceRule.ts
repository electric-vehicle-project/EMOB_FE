// EMOB-2025 - VehiclePriceRule model
// Đồng bộ 100% với backend & Swagger

/** Enum trạng thái xe tương ứng với BE: VehicleStatus.java */
export type VehicleStatus =
  | "NORMAL"
  | "SPECIAL"
  | "OLD_STOCK"
  | "TEST_DRIVE"
  | "RESERVED";

/** Model phản hồi từ API (getAllRules, getRuleByStatus) */
export interface VehiclePriceRule {
  vehicleStatus: VehicleStatus;
  multiplier: number;
  note: string;
}

/** Payload gửi khi PUT (update toàn bộ rules) */
export type VehiclePriceRuleUpsertPayload = VehiclePriceRule[];

/** Hiển thị tiếng Việt tương ứng cho status */
export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  NORMAL: "Xe mới",
  SPECIAL: "Xe đặc biệt",
  OLD_STOCK: "Xe đã đặt cọc",
  TEST_DRIVE: "Xe lái thử",
  RESERVED: "Xe được đặt trước",
};

/** Gợi ý màu tag theo trạng thái */
export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  NORMAL: "green",
  SPECIAL: "purple",
  OLD_STOCK: "orange",
  TEST_DRIVE: "blue",
  RESERVED: "gold",
};

/** Chuẩn hóa status (trường hợp FE nhập text hoặc lowercase) */
export const normalizeVehicleStatus = (status: string): VehicleStatus => {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  const validStatuses: VehicleStatus[] = [
    "NORMAL",
    "SPECIAL",
    "OLD_STOCK",
    "TEST_DRIVE",
    "RESERVED",
  ];
  if (validStatuses.includes(normalized as VehicleStatus)) {
    return normalized as VehicleStatus;
  }
  throw new Error(`Invalid vehicleStatus: ${status}`);
};
