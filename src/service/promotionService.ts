// src/service/promotionService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/promotion";

// ======= Lấy danh sách khuyến mãi theo phạm vi (GLOBAL / LOCAL) =======
export const usePromotionList = (scope: string, page = 0, size = 10) =>
  createQueryHook("promotionList", `${BASE_URL}/view-all/{scope}`)(
    {},
    { scope, page, size }
  );

// ======= Lấy danh sách khuyến mãi của đại lý =======
export const usePromotionHistory = (dealerId: string) =>
  createQueryHook("promotionHistory", `${BASE_URL}/history`)(
    {},
    { id: dealerId }
  );

// ======= Lấy chi tiết khuyến mãi =======
export const usePromotionById = createQueryWithPathParamHook(
  "promotionDetail",
  BASE_URL
);

// ======= Tạo mới khuyến mãi =======
export const usePromotionCreate = createMutationHook(
  "promotionCreate",
  BASE_URL
);

// ======= Cập nhật khuyến mãi (EVM/Dealer Staff) =======
export const usePromotionUpdate = updateMutationHook(
  "promotionUpdate",
  BASE_URL
);

// ======= Cập nhật giá trị (Admin/Manager duyệt) =======
export const usePromotionUpdateValue = updateMutationHook(
  "promotionUpdateValue",
  `${BASE_URL}/value`
);

// ======= Xoá khuyến mãi =======
export const usePromotionDelete = deleteMutationHook(
  "promotionDelete",
  BASE_URL
);
