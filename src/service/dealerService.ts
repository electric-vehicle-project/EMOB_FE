import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import api from "../config/api";
import type { IDealer } from "../model/Dealer";

// Interface for API response data structure
interface DealerApiResponse {
  id: string;
  name: string;
  contactInfo: string;
  address?: string;
  country?: string;
}

/* =========================================================
   🔹 QUERY HOOKS
   ========================================================= */

// 🟢 Lấy danh sách đại lý (GET /dealer?page=0&size=1000)
export const useDealerList = createQueryHook("dealers", "/dealer");

// 🟢 Lấy chi tiết đại lý theo ID (GET /dealer/{id})
export const useDealerById = createQueryWithPathParamHook("dealer", "/dealer");

/* =========================================================
   🔹 MUTATION HOOKS
   ========================================================= */

// 🟩 Tạo mới đại lý (POST /dealer)
export const useDealerCreate = createMutationHook("dealers", "/dealer");

// 🟨 Cập nhật đại lý (PUT /dealer/{id})
export const useDealerUpdate = updateMutationHook("dealers", "/dealer");

// 🟥 Xóa đại lý (DELETE /dealer/{id})
export const useDealerDelete = deleteMutationHook("dealers", "/dealer");

/* =========================================================
   🔹 WRAPPER API TRỰC TIẾP (dành cho file cũ, như PromotionCreatePage)
   ========================================================= */

export const getAllDealers = async (): Promise<IDealer[]> => {
  try {
    const res = await api.get("/dealer", { params: { page: 0, size: 1000 } });
    const data = res.data?.result?.data ?? [];

    // Validate that data is an array
    if (!Array.isArray(data)) {
      console.warn("⚠️ API response data is not an array:", data);
      return [];
    }

    // Chuẩn hoá về model IDealer với type safety
    return data
      .filter((item): item is DealerApiResponse => {
        // Type guard to ensure item has required properties
        return (
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.contactInfo === "string"
        );
      })
      .map(
        (d: DealerApiResponse): IDealer => ({
          id: d.id,
          name: d.name,
          email: d.contactInfo,
          phone: "", // BE chưa có trường phone
          address: d.address || d.country || "",
          status: "Active",
        })
      );
  } catch (error) {
    console.error("❌ Lỗi khi gọi GET /dealer:", error);
    return [];
  }
};
