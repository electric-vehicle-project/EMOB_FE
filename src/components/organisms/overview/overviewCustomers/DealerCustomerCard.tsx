/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import DealerCustomerToolbar from "./DealerCustomerToolbar";
import { ResponsiveBar } from "@nivo/bar";
import { useCustomersByIds } from "../../../../service/overviewRevenueDealer";

interface CustomerData {
  customerId: string;
  totalVehiclesPurchased: number;
  totalRevenue: number;
  totalContracts: number;
}

interface Props {
  data: CustomerData[];
  dealer: string;
}

export default function DealerCustomerCard({ data, dealer }: Props) {
  const [metric, setMetric] = useState<
    "totalRevenue" | "totalVehiclesPurchased"
  >("totalRevenue");

  // Lấy tất cả customerId (loại bỏ duplicate)
  const ids = useMemo(() => {
    return Array.from(new Set(data.map((c) => c.customerId)));
  }, [data]);

  // Gọi API lấy thông tin khách hàng theo ID
  const { data: customers, isLoading } = useCustomersByIds(ids);

  // 🗺️ Tạo map id -> name (ổn định hơn, có kiểm tra type)
  const nameMap = useMemo(() => {
    const map: Record<string, string> = {};

    // Một số API trả về dạng { data: [...] } hoặc { customers: [...] }
    const list: any[] = Array.isArray(customers)
      ? customers
      : (customers as any)?.data || (customers as any)?.customers || [];

    list.forEach((c: any) => {
      if (c?.id && c?.name) {
        map[c.id] = c.name;
      }
    });

    return map;
  }, [customers]);

  const title =
    metric === "totalRevenue"
      ? `Doanh thu khách hàng (${dealer})`
      : `Số xe khách hàng đã mua (${dealer})`;

  // Chuẩn hóa dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    return data.map((item) => ({
      customer: nameMap[item.customerId] || item.customerId, // fallback sang ID nếu chưa có name
      value:
        metric === "totalRevenue"
          ? item.totalRevenue
          : item.totalVehiclesPurchased,
    }));
  }, [data, metric, nameMap]);

  // scale
  const maxValue = Math.max(...chartData.map((d) => d.value), 0);
  const tickValues =
    metric === "totalVehiclesPurchased"
      ? Array.from({ length: Math.ceil(maxValue) + 1 }, (_, i) => i)
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <DealerCustomerToolbar metric={metric} onChange={setMetric} />
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="h-[380px] flex items-center justify-center bg-gray-50 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] p-4 rounded-2xl border-[14px] border-[#0f172a]">
          <div style={{ height: 380 }}>
            <ResponsiveBar
              data={chartData}
              keys={["value"]}
              indexBy="customer"
              margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
              padding={0.3}
              colors={["#10b981"]}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                legend: "Khách hàng",
                legendPosition: "middle",
                legendOffset: 40,
                tickRotation: -45, // xoay label nếu dài
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                legend:
                  metric === "totalRevenue"
                    ? "Doanh thu (VNĐ)"
                    : "Số xe đã mua",
                legendPosition: "middle",
                legendOffset: -70,
                tickValues,
              }}
              enableGridY
              gridYValues={tickValues}
              enableLabel={false}
              theme={{
                text: {
                  fill: "#cbd5e1",
                  fontSize: 11,
                },
                grid: { line: { stroke: "#1e293b" } },
                axis: {
                  ticks: { text: { fill: "#cbd5e1" } },
                  legend: { text: { fill: "#e2e8f0", fontSize: 12 } },
                },
              }}
              tooltip={({ indexValue, value }) => (
                <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-lg text-xs">
                  <div className="font-semibold text-gray-800">
                    {indexValue}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {metric === "totalRevenue"
                      ? `${Number(value).toLocaleString("vi-VN")} VNĐ`
                      : `${value} xe`}
                  </div>
                </div>
              )}
              motionConfig="gentle"
            />
          </div>
        </div>
      )}

      {/* Danh sách khách hàng */}
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="text-gray-400 italic text-center py-2">
            Đang tải tên khách hàng...
          </div>
        ) : (
          data.map((item) => {
            const customerName = nameMap[item.customerId] || item.customerId;
            return (
              <div
                key={item.customerId}
                className="flex justify-between items-center border-b border-gray-100 pb-2 hover:bg-gray-50 px-2 py-1 rounded transition"
              >
                <div className="text-gray-800 font-medium">
                  {customerName}
                  {customerName === item.customerId && (
                    <span className="text-xs text-gray-400 ml-2">(ID)</span>
                  )}
                </div>
                <div className="text-gray-600 font-mono text-sm">
                  {metric === "totalRevenue"
                    ? `${item.totalRevenue.toLocaleString("vi-VN")} VNĐ`
                    : `${item.totalVehiclesPurchased.toLocaleString(
                        "vi-VN"
                      )} xe`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
