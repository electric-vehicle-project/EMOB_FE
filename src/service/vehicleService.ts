// ==================================
// EMOB 2025 - Vehicle Service
// KHÔNG sửa useApi.ts, KHÔNG sửa api.ts
// ==================================
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
  useQuery,
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

// ========== UPDATE PRICES (đặc thù: PUT /vehicle/{id}/prices) ==========
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
      // làm tươi chi tiết xe và list
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

// ========== BULK CREATE UNITS ==========
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

// ========== UNITS by MODEL (có params page/size) ==========
export const useGetVehicleUnitsByVehicleIdPaged = (
  modelId: string,
  params: { page: number; size: number },
  options?: unknown
): UseQueryResult<{
  units: unknown[];
  metadata?: { totalElements?: number } | Record<string, unknown>;
}> => {
  return useQuery<{
    units: unknown[];
    metadata?: { totalElements?: number } | Record<string, unknown>;
  }>({
    queryKey: ["get-vehicle-units-by-model", modelId, params.page, params.size],
    queryFn: async () => {
      const res = await api.get(`${UNIT_URL}/view-all-by-model/${modelId}`, {
        params,
      });
      return res.data;
    },
    ...(typeof options === "object" && options !== null
      ? (options as Record<string, unknown>)
      : {}),
    select: (data: unknown) => {
      type ApiResult = {
        result?: { data?: unknown[]; metadata?: unknown };
        data?: unknown | unknown[];
        metadata?: unknown;
      };
      const d = data as ApiResult;
      const units = Array.isArray(d.result?.data)
        ? d.result?.data
        : Array.isArray(d.data)
        ? (d.data as unknown[])
        : [];
      const metadata = (d.result?.metadata ?? d.metadata) as
        | { totalElements?: number }
        | Record<string, unknown>
        | undefined;
      return { units, metadata };
    },
  });
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
  const queryClient = useQueryClient(); // ✅ Thêm dòng này

  return useMutation({
    mutationFn: async (vehicleUnitIds: string[]) => {
      const body = { vehicleUnitIds };
      const res = await api.delete(`/vehicle/vehicle-units`, { data: body });
      return res.data;
    },
    onSuccess: () => {
      // ✅ Làm tươi dữ liệu các list units liên quan
      queryClient.invalidateQueries({
        queryKey: ["get-vehicle-units-by-model"],
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-vehicle-units"] });
    },
  });
};
