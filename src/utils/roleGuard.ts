// EMOB-2025 - roleGuard (robust)
import type { Role } from "../model/Account";

/** Chuẩn hoá role từ nhiều kiểu dữ liệu/state khác nhau */
export const normalizeRole = (raw: unknown): Role | null => {
  const pick = (v: unknown) => {
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown> & { 0?: unknown };
      return (
        (o as { role?: unknown }).role ??
        (o as { roleName?: unknown }).roleName ??
        (o as { code?: unknown }).code ??
        (o as { name?: unknown }).name ??
        o[0] ??
        v
      );
    }
    return v as unknown;
  };
  const r = pick(raw);
  const s = String(r ?? "")
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (s.includes("ADMIN")) return "ADMIN";
  if (s.includes("EVM")) return "EVM_STAFF";
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
export const canEditVehicle = (role?: Role | null) => isEvmStaff(role); // EVM sửa thông tin chung
export const canUpdatePrice = (role?: Role | null) => isAdmin(role); // chỉ ADMIN cập nhật giá
export const canDeleteVehicle = (role?: Role | null) => isEvmStaff(role); // EVM được xoá

// Units
export const canBulkCreateUnits = (role?: Role | null) => isEvmStaff(role);
export const canViewUnits = () => true;

// Compare
export const canCompareVehicles = () => true;

// Base path (chấp nhận raw role luôn)
export const getRoleBasePath = (raw?: unknown) => {
  const role = normalizeRole(raw);
  if (role === "ADMIN") return "/admin";
  if (role === "EVM_STAFF") return "/evm_staff";
  if (role === "MANAGER") return "/manager";
  if (role === "DEALER_STAFF") return "/dealer_staff";

  if (typeof window !== "undefined") {
    const seg = window.location.pathname.split("/")[1];
    if (["admin", "evm_staff", "manager", "dealer_staff"].includes(seg))
      return `/${seg}`;
  }
  return "/evm_staff";
};

// Helper: vehicle đã có cả giá import + retail?
export const hasVehiclePriced = (v?: {
  importPrice?: number | null;
  retailPrice?: number | null;
}) =>
  typeof v?.importPrice === "number" &&
  v.importPrice > 0 &&
  typeof v?.retailPrice === "number" &&
  v.retailPrice > 0;
