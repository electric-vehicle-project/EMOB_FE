// ===== Enums theo BE =====
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "POINT";

export type PromotionScope = "GLOBAL" | "LOCAL";

export type PromotionStatus = "UPCOMING" | "ACTIVE" | "INACTIVE" | "EXPIRED";

// ===== Entity theo Swagger =====
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: PromotionType | null;
  value: number | null;
  minValue?: number | null;
  startDate: string | null;
  endDate: string | null;
  scope: PromotionScope;
  status: PromotionStatus | null;
  createAt: string;

  dealerIds: string[];
  vehicleIds: string[];
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
