import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
} from "../hook/useApi";
import { useMutation } from "@tanstack/react-query";
import api from "../config/api";

// ========================================================
// QUERY HOOKS
// ========================================================

// [Dealer | Manager] - Lấy danh sách toàn bộ lịch lái thử (phân trang + lọc)
export const useTestDriveQuery = createQueryHook(
  "testDrives",
  "/test-drives"
);

// [Dealer Staff] - Lấy danh sách lịch lái thử của chính nhân viên
export const useTestDriveByStaffQuery = createQueryHook(
  "testDrivesByStaff",
  "/test-drives/staff"
);

// [Dealer Staff | Manager] - Xem chi tiết lịch lái thử theo ID
export const useTestDriveDetailQuery = createQueryWithPathParamHook(
  "testDriveDetail",
  "/test-drives"
);

// [Dealer Staff] - Lấy danh sách xe khả dụng trong khung giờ
// GET /api/test-drives/free-vehicles?scheduledAt=...&duration=...&model=...
export const useFreeVehiclesQuery = createQueryHook(
  "freeVehicles",
  "/test-drives/free-vehicles"
);

// ========================================================
// MUTATION HOOKS
// ========================================================

// [Dealer Staff] - Tạo mới lịch lái thử (POST /test-drives)
export const useCreateTestDriveMutation = createMutationHook(
  "createTestDrive",
  "/test-drives"
);

// ========================================================
// CUSTOM HOOKS (PUT và DELETE có Path Param)
// ========================================================

// PUT /api/test-drives/{id} - Cập nhật lịch lái thử
export const useUpdateTestDriveMutation = () =>
  useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        customerId: string;
        testDriveVehicleId: string;
        location: string;
        duration: number;
        scheduledAt: string;
      };
    }) => {
      const res = await api.put(`/test-drives/${id}`, data);
      return res.data;
    }
  });

// DELETE /api/test-drives/{id} - Hủy lịch lái thử
export const useDeleteTestDriveMutation = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/test-drives/${id}`);
      return res.data;
    }
  });
