import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import type { IReport } from "../model/Report";

const BASE_URL = "/report";

// GET /report/view-all?page=&size=&keyword=&status=&sortField=&sortDir=
export const useReportList = (
  page = 0,
  size = 10,
  keyword?: string,
  status?: IReport["status"],
  sortField = "createdAt",
  sortDir: "asc" | "desc" = "desc"
) =>
  createQueryHook("reportList", `${BASE_URL}/view-all`)(
    {},
    { page, size, keyword, status, sortField, sortDir }
  );

// GET /report/{id}
export const useReportById = createQueryWithPathParamHook(
  "reportDetail",
  BASE_URL
);

// POST /report
export const useReportCreate = createMutationHook("reportList", BASE_URL);

// PUT /report/{id}
export const useReportUpdate = updateMutationHook("reportList", BASE_URL);

// DELETE /report/{id}
export const useReportDelete = deleteMutationHook("reportList", BASE_URL);

/** PUT /report/process-report/{id}?status=IN_PROGRESS|RESOLVED
 *  body: { solution?: string }
 */
export const useReportProcess = updateMutationHook(
  "reportList",
  `${BASE_URL}/process-report`
);
