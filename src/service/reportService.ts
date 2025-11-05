// EMOB-2025 - reportService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import type { IReport } from "../model/report";

const BASE_URL = "/report";

/* ===== Query hooks ===== */
export const useReportList = (
  page = 0,
  size = 10,
  keyword?: string,
  status?: IReport["status"],
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

/* ===== CRUD hooks ===== */
export const useReportCreate = createMutationHook("reportList", BASE_URL);
export const useReportUpdate = updateMutationHook("reportList", BASE_URL);
export const useReportDelete = deleteMutationHook("reportList", BASE_URL);

/* ===== Process status hook ===== */
// PUT /report/process-report/{id}?status=...
export const useReportProcess = updateMutationHook("reportList", BASE_URL);
