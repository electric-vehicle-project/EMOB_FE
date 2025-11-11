import { useQuery } from "@tanstack/react-query";
import { createQueryHook, createQueryWithPathParamHook } from "../hook/useApi";
import type { DealerApiResponse } from "../model/Overview";
import type { ICustomer } from "../model/Customer";

const DEALER_URL = "/revenue/dealers-revenue";
const CUSTOMER_URL = "/revenue/current-dealer-revenue";

export const useDealerReportQuery = createQueryHook(
  "dealer-report",
  DEALER_URL
) as (
  options?: Record<string, unknown>,
  params?: {
    year?: number;
    region?: string;
    country?: string;
  }
) => {
  data?: DealerApiResponse;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
};

export const useDealerCustomerReportQuery = createQueryHook(
  "dealer-customer-report",
  CUSTOMER_URL
);

export function useCustomersByIds(ids: string[]) {
  const isEnabled = Array.isArray(ids) && ids.length > 0;

  const { data, isLoading, isError } = useQuery<ICustomer[]>({
    queryKey: ["customersByIds", ids.slice().sort()],
    queryFn: async () => {
      const fallback = (id: string): ICustomer => ({
        id,
        fullName: `Khách hàng #${id.slice(-6)}`,
      });

      if (!isEnabled) return [];

      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/customers/${id}`, {
              headers: { Accept: "application/json" },
            });

            if (!res.ok) return fallback(id);

            const json = await res.json();
            const name =
              json?.result?.fullName ||
              json?.result?.data?.fullName ||
              json?.data?.fullName ||
              json?.fullName ||
              json?.result?.name ||
              json?.data?.name ||
              json?.name;

            return {
              id,
              name: (name && name.trim()) || fallback(id).fullName,
            };
          } catch (error) {
            console.error(`Lỗi lấy dữ liệu khách hàng ${id}:`, error);
            return fallback(id);
          }
        })
      );

      return results;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });

  return {
    data: data ?? [],
    isLoading,
    isError,
  };
}
