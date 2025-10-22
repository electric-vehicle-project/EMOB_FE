import { createMutationHook } from "../hook/useApi";

export const useLoginMutation = createMutationHook("login", "/auth/login");
