import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  updateMutationHook,
  deleteMutationHook,
} from "../hook/useApi";
import type { PromotionPage, PromotionScope } from "../model/Promotion";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const BASE = "/api/promotion";

// ======= LIST =======
export const usePromotionList = (
  scope: PromotionScope,
  page = 1,
  size = 10,
  options?: UseQueryOptions<
    { code: number; message: string; result: PromotionPage },
    AxiosError<{ message: string }>
  >
) =>
  createQueryHook(
    `promotions:list:${scope}:${page}:${size}`,
    `${BASE}/view-all/${scope}`
  )(options, { page: Math.max(page - 1, 0), size });

// ======= DETAIL =======
export const usePromotionDetail = (
  id?: string,
  options?: UseQueryOptions<
    { code: number; message: string; result: unknown },
    AxiosError<{ message: string }>
  >
) => createQueryWithPathParamHook("promotions:detail", BASE)(id, options);

// ======= CREATE =======
export const usePromotionCreate = (id?: string) =>
  createMutationHook("promotions:list:invalidate", BASE)(id);

// ======= UPDATE =======
export const usePromotionUpdate = (id?: string) =>
  updateMutationHook("promotions:detail", BASE)(id);

// ======= DELETE =======
export const usePromotionDelete = (id?: string) =>
  deleteMutationHook("promotions:list:invalidate", BASE)(id);
