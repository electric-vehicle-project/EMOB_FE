// src/service/vehicleService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
  createMutationUploadFilesHook,
} from "../hook/useApi";
import {
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import api from "../config/api";

const BASE_URL = "/vehicle";
const UNIT_URL = "/vehicle/unit";

// ========== LIST ==========
export const useGetVehicles = (params?: unknown, options?: unknown) => {
  const hook = createQueryHook("get-vehicles", BASE_URL);
  const query = hook(options, params);

  const vehicles =
    (query.data?.result?.data as unknown[]) ||
    (query.data?.data as unknown[]) ||
    [];
  const metadata = query.data?.result?.metadata || query.data?.metadata;

  return { ...query, vehicles, metadata };
};

// ========== DETAIL ==========
export const useGetVehicleById = (id?: string, options?: unknown) => {
  const hook = createQueryWithPathParamHook("get-vehicle-by-id", BASE_URL);
  const query = hook(id, options);
  const vehicle = query.data?.result || query.data;
  return { ...query, vehicle };
};

// ========== CREATE ==========
export const useCreateVehicle = () =>
  createMutationHook("create-vehicle", BASE_URL)();

// ========== UPDATE MODEL (không phải giá) ==========
export const useUpdateVehicle = () =>
  updateMutationHook("update-vehicle", BASE_URL)();

// ========== DELETE ==========
export const useDeleteVehicle = () =>
  deleteMutationHook("delete-vehicle", BASE_URL)();

// ========== UPDATE PRICES (PUT /vehicle/{id}/prices) ==========
export const useUpdateVehiclePrices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { importPrice: number; retailPrice: number };
    }) => {
      const res = await api.put(`${BASE_URL}/${id}/prices`, data);
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["get-vehicle-by-id", vars.id],
      });
      queryClient.invalidateQueries({ queryKey: ["get-vehicles"] });
    },
  });
};

// ========== UPLOAD IMAGES ==========
export const useUploadVehicleImages = () =>
  createMutationUploadFilesHook(
    "upload-vehicle-images",
    `${BASE_URL}/images`
  )();

// ========== BULK CREATE UNITS (cũ) ==========
export const useBulkCreateVehicleUnits = () =>
  createMutationHook("bulk-create-vehicle-units", `${UNIT_URL}/bulk`)();

// ========== UNITS by MODEL (simple, không params) ==========
export const useGetVehicleUnitsByVehicleId = (
  modelId?: string,
  options?: unknown
) => {
  const hook = createQueryWithPathParamHook(
    "get-vehicle-units-by-model",
    `${UNIT_URL}/view-all-by-model`
  );
  const query = hook(modelId, options);

  const units =
    (query.data?.result?.data as unknown[]) ||
    (query.data?.data as unknown[]) ||
    [];
  const metadata = query.data?.result?.metadata || query.data?.metadata;
  return { ...query, units, metadata };
};

// ========== UNITS by MODEL (có params page/size/filter/sort theo BE) ==========
type VehicleUnitListParams = {
  page: number;
  size: number;
  statuses?: string[];
  sortField?: string; // map trực tiếp field sort theo BE
  sortDir?: "asc" | "desc" | "ASC" | "DESC";
};

type VehicleUnitListResult = {
  units: unknown[];
  metadata?: { totalElements?: number } | Record<string, unknown>;
};

export const useGetVehicleUnitsByVehicleIdPaged = (
  modelId: string,
  params: VehicleUnitListParams,
  options?: unknown
): UseQueryResult<VehicleUnitListResult> => {
  const hook = createQueryWithPathParamHook(
    "get-vehicle-units-by-model",
    `${UNIT_URL}/view-all-by-model`
  );

  const safeOptions =
    typeof options === "object" && options !== null
      ? (options as Record<string, unknown>)
      : {};

  const mergedOptions: Record<string, unknown> = {
    ...safeOptions,
    queryKey: [
      "get-vehicle-units-by-model",
      modelId,
      params.page,
      params.size,
      params.statuses ?? null,
      params.sortField ?? null,
      params.sortDir ?? null,
    ],
    queryFn: async () => {
      const res = await api.get(`${UNIT_URL}/view-all-by-model/${modelId}`, {
        params,
      });
      return res.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    select: (data: unknown) => {
      type ApiResult = {
        result?: { data?: unknown[]; metadata?: unknown };
        data?: unknown | unknown[];
        metadata?: unknown;
      };

      const d = data as ApiResult;

      const units = Array.isArray(d.result?.data)
        ? d.result.data ?? []
        : Array.isArray(d.data)
        ? (d.data as unknown[])
        : [];

      const metadata = (d.result?.metadata ?? d.metadata) as
        | { totalElements?: number }
        | Record<string, unknown>
        | undefined;

      const result: VehicleUnitListResult = { units, metadata };
      return result;
    },
  };

  return hook(modelId, mergedOptions) as UseQueryResult<VehicleUnitListResult>;
};

// ========== ALL UNITS ==========
export const useGetAllVehicleUnits = (params?: unknown, options?: unknown) => {
  const hook = createQueryHook("get-all-vehicle-units", `${UNIT_URL}/view-all`);
  const query = hook(options, params);

  const units =
    (query.data?.result?.data as unknown[]) ||
    (query.data?.data as unknown[]) ||
    [];
  const metadata = query.data?.result?.metadata || query.data?.metadata;

  return { ...query, units, metadata };
};

// ✅ Hook mới dùng đúng endpoint /vehicle/bulk và đúng chuẩn useApi
export const useCreateVehicleUnitsBulk = () =>
  createMutationHook("vehicleUnitBulk", "/vehicle/bulk")();

// ========== BULK DELETE VEHICLE UNITS ==========
export const useDeleteVehicleUnitsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleUnitIds: string[]) => {
      const body = { vehicleUnitIds };
      const res = await api.delete(`/vehicle/vehicle-units`, { data: body });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-vehicle-units-by-model"],
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-vehicle-units"] });
    },
  });
};

// ========== AI Demand Forecast (GET /vehicle/demandForecastFromAI, dùng modelName) ==========
export const useGetAIDemandForecast = () => {
  return {
    refetch: async (modelName?: string) => {
      if (!modelName) return null;

      const token = localStorage.getItem("token") ?? "";
      const url = `${
        import.meta.env.VITE_BASE_URL
      }/vehicle/demandForecastFromAI?model=${encodeURIComponent(modelName)}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return res.json();
    },
  };
};




// ========== (Giữ lại, nhưng BulkPage không dùng) ==========
export const useCreateAIDemandForecasts = (vehicleId?: string) => {
  return {
    refetch: async () => {
      if (!vehicleId) return null;

      const token = localStorage.getItem("token") ?? "";
      const url = `${
        import.meta.env.VITE_BASE_URL
      }/vehicle/createDemandForecasts?model=${vehicleId}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return res.json();
    },
  };
};
