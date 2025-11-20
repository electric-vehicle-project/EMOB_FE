/* EMOB-2025 - Account Service */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../config/api";
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import type { IAccount } from "../model/Account";

const BASE_URL = "/auth";

export interface AccountQueryParams {
  page?: number;
  size?: number;
  sortField?: string;
  sortDir?: "asc" | "desc";
  // Các filter khác (keyword, status, role, ...) nếu BE có hỗ trợ sẽ được truyền thêm vào đây
  [key: string]: unknown;
}

/** ADMIN /api/auth/by-admin?page&size&sortField&sortDir&... */
export const useGetAccountsByAdmin = (
  params: AccountQueryParams = {},
  options?: Record<string, unknown>
) => {
  const {
    page = 0,
    size = 10,
    sortField = "createdAt",
    sortDir = "desc",
    ...restFilters
  } = params;

  const queryParams = {
    page,
    size,
    sortField,
    sortDir,
    ...restFilters, // ví dụ: keyword, status, role nếu có
  };

  const query = createQueryHook("accounts-by-admin", `${BASE_URL}/by-admin`)(
    options,
    queryParams
  );

  const accounts: IAccount[] = query.data?.result?.data ?? [];
  const meta = query.data?.result?.metadata ?? null;

  return { ...query, data: accounts, meta };
};

/** MANAGER /api/auth/by-manager?page&size&sortField&sortDir&... */
export const useGetAccountsByManager = (
  params: AccountQueryParams = {},
  options?: Record<string, unknown>
) => {
  const {
    page = 0,
    size = 10,
    sortField = "createdAt",
    sortDir = "desc",
    ...restFilters
  } = params;

  const queryParams = {
    page,
    size,
    sortField,
    sortDir,
    ...restFilters,
  };

  const query = createQueryHook(
    "accounts-by-manager",
    `${BASE_URL}/by-manager`
  )(options, queryParams);

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

// export const useUpdateAccountProfile = createMutationHook(
//   "update-account-profile",
//   `${BASE_URL}/profile`
// );
// ✅ Đổi mật khẩu đúng API backend
export const useChangePassword = createMutationHook(
  "change-password",
  `${BASE_URL}/reset-password`
);

export type ProfileUpdatePayload = {
  fullName: string;
  gender: "MALE" | "FEMALE" | "UNKNOWN";
  address: string;
  dateOfBirth?: string; // YYYY-MM-DD
  phone: string;
};

export const useUpdateAccountProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      api.put(`${BASE_URL}/profile`, payload),
    onSuccess: () => {
      // Nếu sau này có GET /auth/profile thì invalidate sẵn
      queryClient.invalidateQueries({ queryKey: ["account-profile"] });
    },
  });
};
