import {
  createQueryHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

// ===============================
// QUERY HOOKS
// ===============================
export const useDealers = createQueryHook("dealers", "/dealer"); // GET all dealers
export const useDealerById = createQueryHook("dealerById", "/dealer"); // GET by id

// ===============================
// MUTATION HOOKS
// ===============================
export const useCreateDealer = createMutationHook("dealers", "/dealer"); // POST
export const useUpdateDealer = updateMutationHook("dealers", "/dealer"); // PUT
export const useDeleteDealer = deleteMutationHook("dealers", "/dealer"); // DELETE
