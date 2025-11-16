import { ResponsiveBar } from "@nivo/bar";
import { motion } from "framer-motion";

interface ChartData {
  customer: string;
  value: number;
}

interface Props {
  data: ChartData[];
  metric: "totalRevenue" | "totalVehiclesPurchased";
  title?: string; // 👈 bạn đã khai báo đúng
}

export default function DealerCustomerChart({ data, metric, title }: Props) {
  // render state
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col items-center justify-center h-[380px]"
      >
        <svg
          className="w-16 h-16 text-gray-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-gray-400 font-medium">Chưa có dữ liệu khách hàng</p>
        <p className="text-gray-300 text-sm mt-1">
          Dữ liệu sẽ xuất hiện khi có giao dịch
        </p>
      </motion.div>
    );
  }

  // Tính toán tickValues động số xe hiển thị theo từng đơn vị
  const maxValue = Math.max(...data.map((d) => d.value));
  const tickValues =
    metric === "totalVehiclesPurchased"
      ? Array.from({ length: Math.ceil(maxValue) + 1 }, (_, i) => i)
      : undefined;

  // Tính toán tổng / trung bình
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const average = total / data.length;

  // title
  const chartTitle =
    title ||
    (metric === "totalRevenue"
      ? "Doanh thu theo tháng"
      : "Số xe đã mua theo tháng");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 24px rgba(98, 114, 84, 0.25)",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 bg-gradient-to-b from-[#627254] to-[#76885b] rounded-full" />
        <h2 className="text-xl font-bold text-gray-800">{chartTitle}</h2>
      </div>
      {/* Biểu đồ */}

      <div className="bg-white rounded-xl p-3">
        <div style={{ height: 380 }}>
          <ResponsiveBar
            colors={["#5e6e51"]}
            data={data}
            keys={["value"]}
            indexBy="customer"
            margin={{ top: 20, right: 40, bottom: 60, left: 90 }}
            padding={0.35}
            borderRadius={6}
            enableLabel={false}
            axisLeft={{
              tickSize: 5,
              tickPadding: 8,
              legend:
                metric === "totalRevenue" ? "Doanh thu (VNĐ)" : "Số xe đã mua",
              legendPosition: "middle",
              legendOffset: -75,
              tickValues,
              format: (value) =>
                value >= 1000000
                  ? `${(value / 1000000).toFixed(0)}M`
                  : value >= 1000
                  ? `${(value / 1000).toFixed(0)}K`
                  : value,
            }}
            enableGridY
            gridYValues={tickValues}
            theme={{
              textColor: "#0f172a",
              fontSize: 11,
              grid: { line: { stroke: "#e5e7eb", strokeWidth: 1 } },
              axis: {
                ticks: { text: { fill: "#475569", fontSize: 11 } },
                legend: {
                  text: { fill: "#1e293b", fontSize: 12, fontWeight: 600 },
                },
              },
            }}
            tooltip={({ indexValue, value, color }) => (
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-3 h-3 rounded-full ring-2 ring-white shadow"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-gray-800 text-sm">
                    {indexValue}
                  </span>
                </div>
                <div className="font-bold text-gray-900 text-base">
                  {metric === "totalRevenue"
                    ? `${Number(value).toLocaleString("vi-VN")} VNĐ`
                    : `${value} xe`}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metric === "totalRevenue"
                    ? "Tổng doanh thu"
                    : "Tổng số xe đã mua"}
                </div>
              </div>
            )}
            motionConfig="gentle"
            animate
            isInteractive
            role="application"
            ariaLabel="Biểu đồ khách hàng"
          />
        </div>
      </div>
    </motion.div>
  );
}
