import { createMutationHook } from "../hook/useApi";

export const login = createMutationHook("login", "/auth/login");
