// ====== CONSTANTS ======
const QUERY_KEY = "reports";
const BASE_URL = "/report";

// ====== GET all reports (phân trang) ======
export const useReportList = createQueryHook(QUERY_KEY, `${BASE_URL}/view-all`);

// ====== GET report by ID ======
export const useReportById = createQueryWithPathParamHook(QUERY_KEY, BASE_URL);

// ====== CREATE report ======
export const useReportCreate = createMutationHook(QUERY_KEY, BASE_URL);

// ====== UPDATE report ======
export const useReportUpdate = updateMutationHook(QUERY_KEY, BASE_URL);

// ====== DELETE report ======
export const useReportDelete = deleteMutationHook(QUERY_KEY, BASE_URL);

// ====== CHANGE STATUS ======
import { useMutation } from "@tanstack/react-query";
import api from "../config/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  createMutationHook,
  createQueryHook,
  createQueryWithPathParamHook,
  deleteMutationHook,
  updateMutationHook,
} from "../hook/useApi";

/**
 * PUT /api/report/process-report/{reportId}?status=...
 * Đổi trạng thái report (PENDING, DELETED, IN_PROGRESS, RESOLVED)
 */
export const useReportChangeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "PENDING" | "DELETED" | "IN_PROGRESS" | "RESOLVED";
    }) => {
      return api.put(`${BASE_URL}/process-report/${id}?status=${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
