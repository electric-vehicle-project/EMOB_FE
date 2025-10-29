// ==================================
// src/service/vehicleService.ts
// ==================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import api from "../config/api";

// Helper: unwrap phổ biến BE { code, message, result } hoặc trả thẳng
const unwrap = <T = unknown>(res: unknown): T => {
  const d = (res as { data?: unknown })?.data ?? res;
  if (
    d &&
    typeof d === "object" &&
    "result" in (d as Record<string, unknown>)
  ) {
    return (d as { result: T }).result;
  }
  return d as T;
};

// ===== VEHICLES: LIST =====
export const useGetVehicles = (
  params?: {
    keyword?: string;
    brand?: string;
    sortBy?: string;
    page?: number;
    size?: number;
  },
  options?: Record<string, unknown>
): UseQueryResult<unknown, unknown> =>
  useQuery({
    queryKey: ["get-vehicles", params],
    // ⚠️ KHÔNG dùng tiền tố /api ở đây để tránh /api/api/... khi baseURL đã có /api
    queryFn: async () => unwrap(await api.get("/vehicles", { params })),
    ...(options ?? {}),
  });

// Backward-compatible alias
export const useGetAllVehicles = (
  params?: {
    keyword?: string;
    brand?: string;
    sortBy?: string;
    page?: number;
    size?: number;
  },
  options?: Record<string, unknown>
): UseQueryResult<unknown, unknown> => useGetVehicles(params, options);

// ===== VEHICLES: DETAIL =====
export const useGetVehicleById = (
  id: string,
  options?: Record<string, unknown>
): UseQueryResult<unknown, unknown> =>
  useQuery({
    queryKey: ["get-vehicle-by-id", id],
    queryFn: async () => unwrap(await api.get(`/vehicles/${id}`)),
    enabled: !!id,
    ...(options ?? {}),
  });

// ===== VEHICLES: CREATE =====
export const useCreateVehicle = (): UseMutationResult<
  unknown,
  unknown,
  unknown
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: unknown) =>
      unwrap(await api.post("/vehicles", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-vehicles"] });
    },
  });
};

// ===== VEHICLES: UPDATE =====
export const useUpdateVehicle = (): UseMutationResult<
  unknown,
  unknown,
  { id: string; data: unknown }
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) =>
      unwrap(await api.put(`/vehicles/${id}`, data)),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["get-vehicle-by-id", variables.id] });
      qc.invalidateQueries({ queryKey: ["get-vehicles"] });
    },
  });
};

// ===== VEHICLES: DELETE =====
export const useDeleteVehicle = (): UseMutationResult<
  unknown,
  unknown,
  string
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await api.delete(`/vehicles/${id}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-vehicles"] });
    },
  });
};

// ===== VEHICLES: IMAGES UPLOAD =====
export const useUploadVehicleImages = (): UseMutationResult<
  unknown,
  unknown,
  FormData
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) =>
      unwrap(
        await api.post("/vehicles/images", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-vehicles"] });
    },
  });
};

// ===== VEHICLE UNITS: BULK CREATE =====
export const useBulkCreateVehicleUnits = (): UseMutationResult<
  unknown,
  unknown,
  unknown
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: unknown) =>
      unwrap(await api.post("/vehicle-units/bulk", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-vehicles"] });
    },
  });
};

// ===== VEHICLES: UPDATE PRICES (ADMIN) =====
export const useUpdateVehiclePrices = (): UseMutationResult<
  unknown,
  unknown,
  { id: string; data: { importPrice: number; retailPrice: number } }
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) =>
      unwrap(await api.put(`/vehicles/prices/${id}`, data)),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["get-vehicle-by-id", variables.id] });
    },
  });
};

// ===== COMPARISON: OPTIONS =====
export const useGetComparableModels = (
  params: { baseModelId: string },
  options?: Record<string, unknown>
): UseQueryResult<unknown, unknown> =>
  useQuery({
    queryKey: ["get-comparable-models", params?.baseModelId],
    queryFn: async () =>
      unwrap(
        await api.get(`/vehicles/${params.baseModelId}/comparable-options`)
      ),
    enabled: !!params?.baseModelId,
    ...(options ?? {}),
  });

// ===== COMPARISON: EXECUTE =====
export const useCompareModels = (
  params: { leftId?: string; rightId?: string },
  options?: Record<string, unknown>
): UseQueryResult<unknown, unknown> =>
  useQuery({
    queryKey: ["compare-vehicles", params?.leftId, params?.rightId],
    queryFn: async () =>
      unwrap(
        await api.get(`/vehicles/compare`, {
          params: { leftId: params.leftId, rightId: params.rightId },
        })
      ),
    ...(options ?? {}),
  });

// ===== OPTIONAL: Batches by vehicle =====
export const useGetVehicleBatches = (
  params: { vehicleId: string; page?: number; size?: number },
  options?: Record<string, unknown>
): UseQueryResult<unknown, unknown> =>
  useQuery({
    queryKey: [
      "get-vehicle-batches",
      params?.vehicleId,
      params?.page ?? 0,
      params?.size ?? 10,
    ],
    queryFn: async () =>
      unwrap(
        await api.get(`/vehicles/${params.vehicleId}/batches`, {
          params: { page: params.page ?? 0, size: params.size ?? 10 },
        })
      ),
    enabled: !!params?.vehicleId,
    ...(options ?? {}),
  });

// ===== VEHICLE UNITS (for subtable) =====
export const useGetVehicleUnits = (
  vehicleId: string,
  page = 0,
  size = 5
): UseQueryResult<unknown, unknown> =>
  useQuery({
    queryKey: ["get-vehicle-units", vehicleId, page, size],
    queryFn: async () => {
      // endpoint của bạn KHÔNG có /api tiền tố
      const res = await api.get(
        `/vehicle/unit/view-all-by-model/${vehicleId}`,
        { params: { page, size } }
      );
      type UnitsResult = { data?: unknown[]; metadata?: unknown };
      const result = unwrap<UnitsResult>(res); // { data, metadata } theo BE của bạn
      return { data: Array.isArray(result?.data) ? result.data : [] };
    },
    enabled: !!vehicleId,
  });
