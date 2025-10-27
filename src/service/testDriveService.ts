// src/service/testDriveService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/test-drive";

export const useGetTestDriveSchedules = () => {
  const query = createQueryHook("testDrive-schedules", BASE_URL + '/schedules')();
  const testDrives = query.data?.result?.data ?? [];
  return { ...query, data: testDrives };
};

export const useGetTestDriveById = createQueryWithPathParamHook("testDrive-by-id",BASE_URL);
export const useCreateTestDrive = createMutationHook("testDrive-create", BASE_URL);
export const useUpdateTestDrive = updateMutationHook("testDrive-update", BASE_URL);
export const useDeleteTestDrive = deleteMutationHook("testDrive-delete", BASE_URL);


