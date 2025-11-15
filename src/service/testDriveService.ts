import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
} from "../hook/useApi";
import { useMutation } from "@tanstack/react-query";
import api from "../config/api";

// ========================================================
// QUERY HOOKS
// ========================================================

export const useTestDriveQuery = createQueryHook("testDrives", "/test-drives");

export const useTestDriveByStaffQuery = createQueryHook(
  "testDrivesByStaff",
  "/test-drives/staff"
);

export const useTestDriveDetailQuery = createQueryWithPathParamHook(
  "testDriveDetail",
  "/test-drives"
);

export const useFreeVehiclesQuery = createQueryHook(
  "freeTestDriveVehicles",
  "/test-drives/free-vehicles"
);

// ========================================================
// MUTATION HOOKS
// ========================================================

export const useCreateTestDriveMutation = createMutationHook(
  "createTestDrive",
  "/test-drives"
);

export const useUpdateTestDriveMutation = updateMutationHook(
  "updateTestDrive",
  "/test-drives"
);


export const updateStatusTestDrive = async ({
  id,
  status,
}: {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}) => {
  const res = await api.put(`/test-drives/change-status/${id}`, null, {
    params: { status },
  });
  return res.data;
};

export const useUpdateStatusTestDriveMutation = () =>
  useMutation({
    mutationFn: updateStatusTestDrive,
  });


