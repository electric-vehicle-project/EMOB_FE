import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/promotion";

// ======= Lấy danh sách khuyến mãi theo phạm vi (GLOBAL / LOCAL) =======
export const usePromotionList = (
  scope: string | string[],
  page = 0,
  size = 10,
  keyword?: string,
  statuses?: string[],
  sortField = "createAt",
  sortDir: "asc" | "desc" = "desc"
) =>
  createQueryHook("promotionList", `${BASE_URL}/view-all`)(
    {},
    {
      scopes: scope,
      page,
      size,
      keyword,
      statuses,
      sortField,
      sortDir,
    }
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

// BE: PUT /promotion/{id} (DEALER_STAFF / EVM_STAFF)
export type UpdatePromotionPayload = {
  name?: string;
  description?: string;
  dealerIds?: string[];
  electricVehicleIds?: string[];
};

// ======= Cập nhật khuyến mãi (DEALER_STAFF / EVM_STAFF) =======
export const usePromotionUpdate = updateMutationHook(
  "promotionUpdate",
  BASE_URL
);

// ======= Cập nhật giá trị khuyến mãi(ADMIN / MANAGER) =======
// BE: PUT /promotion/value/{id}
export const usePromotionUpdateValue = updateMutationHook(
  "promotionUpdateValue",
  `${BASE_URL}/value`
);

// ======= Xoá khuyến mãi =======
export const usePromotionDelete = deleteMutationHook(
  "promotionDelete",
  BASE_URL
);
