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

// [Dealer | Manager] - Lấy danh sách toàn bộ lịch lái thử có phân trang, lọc, tìm kiếm
export const useTestDriveQuery = createQueryHook("testDrives", "/test-drives");

// [Dealer Staff] - Lấy danh sách lịch lái thử của chính nhân viên hiện tại
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
export const useFreeVehiclesQuery = createQueryHook(
  "freeTestDriveVehicles",
  "/test-drives/free-vehicles"
);

// ========================================================
// MUTATION HOOKS
// ========================================================

// [Dealer Staff] - Tạo lịch lái thử mới cho khách hàng
export const useCreateTestDriveMutation = createMutationHook(
  "createTestDrive",
  "/test-drives"
);

// [Dealer Staff] - Cập nhật lịch lái thử (PUT /test-drives/{id})
export const useUpdateTestDriveMutation = updateMutationHook(
  "updateTestDrive",
  "/test-drives"
);


// [Dealer Staff] - Cập nhật trạng tháit lịch lái thử (PUT /test-drives/change-status/{id})
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

  
// ========================================================
// ADDITIONAL SUPPORT HOOKS (for Create Modal)
// ========================================================

// [Dealer Staff] - Lấy danh sách khách hàng để hiển thị dropdown
// GET /api/customers?page=0&size=10&status=ACTIVE
export const useCustomerQuery = createQueryHook("customers", "/customers");

// [Dealer Staff] - Lấy danh sách model xe điện (EV) để chọn khi tạo lịch lái thử
// GET /api/vehicle?page=0&size=10&type=SEDAN|SUV|HATCHBACK...
export const useVehicleQuery = createQueryHook("vehicles", "/vehicle");
