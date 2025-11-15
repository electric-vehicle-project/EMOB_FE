// ===== Enums theo BE =====
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "POINT";

export type PromotionScope = "GLOBAL" | "LOCAL";

export type PromotionStatus = "UPCOMING" | "ACTIVE" | "INACTIVE" | "EXPIRED";

// ===== Entity theo Swagger =====
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number | null; // có thể null khi chờ duyệt
  minValue: number;
  startDate: string; // ISO
  endDate: string; // ISO
  scope: PromotionScope;
  status: PromotionStatus;
  createAt: string; // ISO
}

// ===== Page theo Swagger =====
export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PromotionPage {
  data: Promotion[];
  metadata: PageMeta;
}
