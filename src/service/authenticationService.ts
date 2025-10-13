import { createMutationHook } from "../hook/useApi";

export const loginService = createMutationHook("login", "/auth/login");
