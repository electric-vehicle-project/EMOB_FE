// EMOB-2025 - roleGuard (robust)
import { Role } from "../model/Account";

/** Chuẩn hoá role từ nhiều kiểu dữ liệu/state khác nhau */
export const normalizeRole = (raw: unknown): Role | null => {
  // chấp nhận: "EVM_STAFF" | "evm_staff" | "EVM" | {name:"EVM_STAFF"} | {code:"EVM"} | ["EVM_STAFF"] ...
  const pick = (v: any) =>
    v?.role ?? v?.roleName ?? v?.code ?? v?.name ?? v?.[0] ?? v;

  const r = pick(raw);
  const s = String(r ?? "")
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (s.includes("ADMIN")) return "ADMIN";
  if (s.includes("EVM")) return "EVM_STAFF"; // khớp cả "EVM" lẫn "EVM_STAFF"
  if (s.includes("MANAGER")) return "MANAGER";
  if (s.includes("DEALER")) return "DEALER_STAFF";
  return null;
};

export const isAdmin = (role?: Role | null) => role === "ADMIN";
export const isEvmStaff = (role?: Role | null) => role === "EVM_STAFF";
export const isManager = (role?: Role | null) => role === "MANAGER";
export const isDealerStaff = (role?: Role | null) => role === "DEALER_STAFF";

// Vehicle actions
export const canCreateVehicle = (role?: Role | null) => isEvmStaff(role);
export const canEditVehicle = (role?: Role | null) => isEvmStaff(role); // sửa thông tin chung (không sửa giá)
export const canUpdatePrice = (role?: Role | null) => isAdmin(role); // chỉ ADMIN cập nhật giá
export const canDeleteVehicle = (role?: Role | null) => isEvmStaff(role); // ✅ chỉ EVM_STAFF được xoá

// Units
export const canBulkCreateUnits = (role?: Role | null) => isEvmStaff(role);
export const canViewUnits = (_role?: Role | null) => true; // BE sẽ filter phạm vi

// Compare
export const canCompareVehicles = (_role?: Role | null) => true; // BE enforce phạm vi

// Base path (chấp nhận raw role luôn)
export const getRoleBasePath = (raw?: unknown) => {
  const role = normalizeRole(raw);
  if (role === "ADMIN") return "/admin";
  if (role === "EVM_STAFF") return "/evm_staff";
  if (role === "MANAGER") return "/manager";
  return "/dealer_staff";
};

// Helper: vehicle đã có giá để cho phép bulk create units?
export const hasVehiclePriced = (v?: {
  importPrice?: number | null;
  retailPrice?: number | null;
}) =>
  typeof v?.importPrice === "number" &&
  v.importPrice > 0 &&
  typeof v?.retailPrice === "number" &&
  v.retailPrice > 0;
