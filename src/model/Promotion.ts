// ===== Enums theo BE =====
export type PromotionType =
  | "PERCENTAGE"
  | "AMOUNT"
  | "ACCESSORY"
  | "INSTALLMENT_SUPPORT";

export type PromotionScope = "GLOBAL" | "LOCAL";

// Lưu ý: status chỉ phụ thuộc thời gian (now vs. start/end),
// KHÔNG liên quan tới việc value đã được duyệt hay chưa.
export type PromotionStatus = "UPCOMING" | "ACTIVE" | "INACTIVE" | "EXPIRED";

// ===== Entity theo ERD =====
// BE có thể trả về value = null nếu chưa được manager duyệt.
export interface Promotion {
  promotionId: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number | null; // <-- null nếu CHƯA duyệt (pending)
  minPrice: number; // <-- bắt buộc
  startDate: string; // ISO
  endDate: string; // ISO
  scope: PromotionScope;
  status: PromotionStatus; // UPCOMING/ACTIVE/INACTIVE/EXPIRED (theo thời gian)
  createdAt: string; // ISO
}

// ===== DTO gửi lên BE =====
// Quy tắc business:
// - staffId: BẮT BUỘC, lấy từ user hiện tại khi bấm "Tạo khuyến mãi" (FE set auto, không cho sửa).
// - minPrice: BẮT BUỘC (nếu không muốn điều kiện thì nhập 0).
// - value: LUÔN = null khi staff tạo → chờ manager duyệt (pending).
export interface PromotionRequestDTO {
  staffId: string; // <-- REQUIRED, lấy từ current user
  dealerId?: string[]; // có -> LOCAL, không có -> GLOBAL (do BE quyết)
  electricVehiclesId?: string[]; // áp cho danh sách EV; để trống = tất cả
  name: string;
  description?: string;
  type: PromotionType;
  value: null; // <-- luôn null ở bước tạo của staff
  minPrice: number;
  startDate: string; // ISO
  endDate: string; // ISO
}

// Khi manager vào chỉnh/duyệt:
// - Tất cả field đều OPTIONAL (kể cả value).
// - Nếu không set value (để null), promotion vẫn nằm trong "chờ duyệt".
export interface UpdatePromotionRequestDTO {
  name?: string;
  description?: string;
  value?: number | null; // <-- có thể bỏ trống hoặc đặt null
  minPrice?: number;
  startDate?: string; // ISO
  endDate?: string; // ISO
}
