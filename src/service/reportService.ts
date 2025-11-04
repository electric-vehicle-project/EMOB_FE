// src/service/reportService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/report";

/* ===== Query hooks ===== */
export const useReportList = (
  page = 0,
  size = 10,
  keyword?: string,
  status?: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DELETED",
  sortField = "title",
  sortDir: "asc" | "desc" = "desc"
) =>
  createQueryHook("reportList", `${BASE_URL}/view-all`)(
    {},
    { page, size, keyword, status, sortField, sortDir }
  );

export const useReportById = createQueryWithPathParamHook(
  "reportDetail",
  BASE_URL
);

/* ===== CRUD ===== */
export const useReportCreate = createMutationHook("reportList", BASE_URL);
export const useReportUpdate = updateMutationHook("reportList", BASE_URL);
export const useReportDelete = deleteMutationHook("reportList", BASE_URL);

/* ===== Process status (PUT /report/process-report/{id}?status=...) =====
   Trick: nhét cả "process-report/{id}?status=..." vào tham số `id` của updateMutationHook
   - invalidates: "reportList" (list sẽ tự refetch)
*/
export const useReportProcess = updateMutationHook("reportList", BASE_URL);

/* (tuỳ chọn) Nếu đang ở trang detail và muốn invalidate đúng cache detail:
   Khởi tạo hook với id của report để invalidate ["reportDetail", reportId]
*/
export const useReportProcessDetail = (reportId: string) =>
  updateMutationHook("reportDetail", BASE_URL)(reportId);
