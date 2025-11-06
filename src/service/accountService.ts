/* EMOB-2025 - Account Service */
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import type { IAccount } from "../model/Account";

const BASE_URL = "/auth";

/* ==================== 🔍 GET ==================== */
/** ADMIN /api/auth/by-admin?page&size */
export const useGetAccountsByAdmin = (
  page = 0,
  size = 10,
  options?: Record<string, unknown> // ✅ cho phép enabled, tránh any
) => {
  const query = createQueryHook(
    `accounts-by-admin-${page}-${size}`,
    `${BASE_URL}/by-admin`
  )(options, { page, size });
  const accounts: IAccount[] = query.data?.result?.data ?? [];
  const meta = query.data?.result?.metadata ?? null;
  return { ...query, data: accounts, meta };
};

/** MANAGER /api/auth/by-manager?page&size */
export const useGetAccountsByManager = (
  page = 0,
  size = 10,
  options?: Record<string, unknown> // ✅ cho phép enabled, tránh any
) => {
  const query = createQueryHook(
    `accounts-by-manager-${page}-${size}`,
    `${BASE_URL}/by-manager`
  )(options, { page, size });
  const accounts: IAccount[] = query.data?.result?.data ?? [];
  const meta = query.data?.result?.metadata ?? null;
  return { ...query, data: accounts, meta };
};

/** GET /api/auth/{id} */
export const useGetAccountById = createQueryWithPathParamHook(
  "account",
  BASE_URL
);

/* ==================== 🧩 POST ==================== */
export const useRegisterByAdmin = () =>
  createMutationHook("accounts-by-admin", `${BASE_URL}/register-by-admin`)();

export const useRegisterByManager = () =>
  createMutationHook(
    "accounts-by-manager",
    `${BASE_URL}/register-by-manager`
  )();

/* ==================== 🚦 PUT ==================== */
/** PUT /api/auth/change-status/{id} body: { status: 'ACTIVE'|'INACTIVE' } */
export const useChangeAccountStatus = () =>
  updateMutationHook("accounts", `${BASE_URL}/change-status`)();

/* ==================== 🚫 DELETE ==================== */
/** DELETE /api/auth/{id}  (Ban vĩnh viễn) */
export const useBanAccount = () =>
  deleteMutationHook("accounts", `${BASE_URL}`)();

/* ==================== 👤 PROFILE ==================== */
// export const useGetAccountProfile = createQueryHook(
//   "account-profile",
//   `${BASE_URL}/profile`
// );
export const useGetAccountProfile = () =>
  createQueryHook("account-profile", `/auth/profile`)();

export const useUpdateAccountProfile = createMutationHook(
  "update-account-profile",
  `${BASE_URL}/profile`
);
// ✅ Đổi mật khẩu đúng API backend
export const useChangePassword = createMutationHook(
  "change-password",
  `${BASE_URL}/reset-password`
);
