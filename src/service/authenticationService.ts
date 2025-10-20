import { createMutationHook } from "../hook/useApi";

export const useLoginMutation = createMutationHook("login", "/auth/login");

export const useLogoutMutation = createMutationHook("logout", "/auth/logout");

export const useRefreshMutation = createMutationHook("refresh", "/auth/refresh");

export const useForgetPasswordMutation = createMutationHook("forget-password", "auth/forgot-password");

export const useResetPasswordMutation = createMutationHook("reset-password", "/auth/reset-password");

export const useVerifyOtpMutation = createMutationHook("verify-otp", "/auth/verify-otp");