// src/service/accountService.ts
import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
} from "../hook/useApi";
import type { IAccount } from "../model/Account";

const BASE_URL = "/auth";

/**
 * ===================
 * 🟢 GET
 * ===================
 */

// 👑 Admin xem tất cả manager + evm staff
export const useGetAccountsByAdmin = () => {
  const query = createQueryHook("accounts-by-admin", `${BASE_URL}/by-admin`)();
  const accounts: IAccount[] = query.data?.result?.data ?? [];
  return { ...query, data: accounts };
};

// 👨‍💼 Manager xem tất cả dealer staff mà mình quản lý
export const useGetAccountsByManager = () => {
  const query = createQueryHook(
    "accounts-by-manager",
    `${BASE_URL}/by-manager`
  )();
  const accounts: IAccount[] = query.data?.result?.data ?? [];
  return { ...query, data: accounts };
};

// 🔍 Lấy chi tiết 1 account theo ID
export const useGetAccountById = createQueryWithPathParamHook(
  "account",
  BASE_URL
);

// =================== PROFILE ===================
export const useGetAccountProfile = createQueryHook(
  "account-profile",
  `${BASE_URL}/profile`
);

export const useUpdateAccountProfile = createMutationHook(
  "account-profile-update",
  `${BASE_URL}/profile`
);

export const useChangePassword = createMutationHook(
  "change-password",
  `${BASE_URL}/change-password`
);

/**
 * ===================
 * 🟢 POST
 * ===================
 */

// 👑 Admin tạo tài khoản Manager / EVM Staff
export const useRegisterByAdmin = createMutationHook(
  "register-by-admin",
  `${BASE_URL}/register-by-admin`
);

// 👨‍💼 Manager tạo tài khoản Dealer Staff
export const useRegisterByManager = createMutationHook(
  "register-by-manager",
  `${BASE_URL}/register-by-manager`
);
