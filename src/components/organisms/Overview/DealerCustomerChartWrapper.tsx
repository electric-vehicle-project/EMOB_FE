import { useMemo } from "react";
import DealerCustomerChart from "./DealerCustomerChart";
import { useCustomersByIds } from "../../../service/overviewRevenueDealer";

interface CustomerData {
  customerId: string;
  totalRevenue: number;
  totalVehiclesPurchased: number;
}

interface Props {
  data: CustomerData[];
  metric: "totalRevenue" | "totalVehiclesPurchased";
}

export default function DealerCustomerChartWrapper({ data, metric }: Props) {
  // check dup
  const ids = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.customerId)));
  }, [data]);

  //  call api
  const { data: customers, isLoading, isError } = useCustomersByIds(ids);

  // convert
  const nameMap = useMemo(() => {
    const map: Record<string, string> = {};

    const list = Array.isArray(customers)
      ? customers
      : customers?.data || customers?.customers || [];

    list.forEach((c: any) => {
      if (!c?.id) return;

      const hasValidName =
        c?.name && c.name.trim() !== "" && c.name !== "Không rõ";

      // Nếu có tên hợp lệ → dùng tên, nếu không → tạo fallback
      map[c.id] = hasValidName ? c.name : `Khách hàng #${c.id.slice(-6)}`;
    });

    return map;
  }, [customers]);

  const enrichedData = useMemo(() => {
    return data.map((item) => ({
      customer:
        nameMap[item.customerId] || `Khách hàng #${item.customerId.slice(-6)}`,
      value:
        metric === "totalRevenue"
          ? item.totalRevenue
          : item.totalVehiclesPurchased,
    }));
  }, [data, metric, nameMap]);

  // loading
  if (isLoading) {
    return (
      <div className="h-[460px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-500"></div>
          <svg
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mt-4">
          Đang tải tên khách hàng...
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Đang xử lý {ids.length} khách hàng
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[460px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-red-100 mb-6">
        <svg
          className="w-16 h-16 text-red-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-600 font-medium">
          Không thể tải thông tin khách hàng
        </p>
        <p className="text-gray-500 text-sm mt-1">Vui lòng thử lại sau</p>
      </div>
    );
  }

  return <DealerCustomerChart data={enrichedData} metric={metric} title="" />;
}
