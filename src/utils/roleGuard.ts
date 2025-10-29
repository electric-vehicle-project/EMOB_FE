// src/utils/roleGuard.ts
import { Role } from "../model/Account"; // đã tồn tại trong dự án của bạn

export const isEvmStaff = (role?: Role | null) => role === "EVM_STAFF";
export const isAdmin = (role?: Role | null) => role === "ADMIN";
export const isManager = (role?: Role | null) => role === "MANAGER";
export const isDealerStaff = (role?: Role | null) => role === "DEALER_STAFF";

export const canCreateVehicle = (role?: Role | null) => isEvmStaff(role);
export const canEditVehicle = (role?: Role | null) => isEvmStaff(role);
export const canDeleteVehicle = (role?: Role | null) => isEvmStaff(role);

// Detail page actions theo yêu cầu:
export const canAddVehicleBatch = (role?: Role | null) => isEvmStaff(role); // thêm lô xe
export const canUpdatePrice = (role?: Role | null) => isAdmin(role); // cập nhật giá
export const canViewDealerBatchesOnly = (role?: Role | null) =>
  isManager(role) || isDealerStaff(role);
export const getRoleBasePath = (role?: Role | null) => {
  if (role === "ADMIN") return "/admin";
  if (role === "EVM_STAFF") return "/evm_staff";
  if (role === "MANAGER") return "/manager";
  return "/dealer_staff";
};
