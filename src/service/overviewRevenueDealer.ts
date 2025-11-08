import { useQuery } from "@tanstack/react-query";
import { createQueryHook, createQueryWithPathParamHook } from "../hook/useApi";
import type { DealerApiResponse } from "../model/Overview";

const BASE_URL = "/dealer/dealer-revenue";
const API_URL = "/dealer/customer-revenue";
export const useDealerReportQuery = createQueryHook(
  "dealer-report",
  BASE_URL
) as (
  options?: Record<string, unknown>,
  params?: {
    month?: number;
    region?: string;
    dealerId?: string;
  }
) => {
  data?: DealerApiResponse;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
};

export const useDealerCustomerReportQuery = createQueryHook(
  "dealer-customer-report",
  API_URL
);

interface Customer {
  id: string;
  name: string;
}

export function useCustomersByIds(ids: string[]) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customersByIds", ids.slice().sort().join(",")],
    queryFn: async (): Promise<Customer[]> => {
      if (!ids || ids.length === 0) return [];

      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/customers/${id}`, {
              headers: { Accept: "application/json" },
            });

            if (!res.ok) return { id, name: `Khách hàng #${id.slice(-6)}` };

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
              name: name?.trim() || `Khách hàng #${id.slice(-6)}`,
            };
          } catch (err) {
            console.error(`⚠️ Error fetching customer ${id}:`, err);
            return { id, name: `Khách hàng #${id.slice(-6)}` };
          }
        })
      );

      return results;
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    data: data ?? [],
    isLoading,
    isError,
  };
}
