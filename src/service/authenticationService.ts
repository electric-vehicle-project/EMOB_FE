import { createMutationHook } from "../hook/useApi";

export const useLoginMutation = createMutationHook("login", "/auth/login");

export const useLogoutMutation = createMutationHook("logout", "/auth/logout");
