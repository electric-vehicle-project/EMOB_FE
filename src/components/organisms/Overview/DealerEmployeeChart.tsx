import { ResponsiveBar } from "@nivo/bar";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../atoms/Card";

interface EmployeeData {
  accountId: string;
  orderCount: number;
  amount: number;
}

interface Props {
  data: EmployeeData[];
  dealer: string;
}

export default function DealerEmployeeChart({ data, dealer }: Props) {
  // Empty state
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center h-[450px]"
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-gray-400 font-medium">Chưa có dữ liệu nhân viên</p>
        <p className="text-gray-300 text-sm mt-1">
          Dữ liệu sẽ xuất hiện khi có giao dịch
        </p>
      </motion.div>
    );
  }

  // Chuẩn bị dữ liệu cho chart
  const chartData = data.map((d, i) => ({
    id: d.accountId,
    name: `NV ${i + 1}`,
    revenue: d.amount,
    orders: d.orderCount,
  }));

  // Tính tổng
  const totalRevenue = data.reduce((sum, d) => sum + d.amount, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orderCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.002 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Doanh số theo nhân viên
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{dealer}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
            {data.length} nhân viên
          </span>
        </div>
      </div>

      {/* Chart trong frame đen */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-[#0f172a] rounded-2xl border-[14px] border-[#0f172a] p-3">
            <div className="bg-white rounded-xl p-3">
              <div style={{ height: 350 }}>
                <ResponsiveBar
                  data={chartData}
                  keys={["revenue"]}
                  indexBy="name"
                  margin={{ top: 20, right: 40, bottom: 60, left: 80 }}
                  padding={0.35}
                  colors={["#10b981"]}
                  borderRadius={6}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    tickRotation: data.length > 10 ? -45 : 0,
                    legend: "Nhân viên bán hàng",
                    legendOffset: 50,
                    legendPosition: "middle",
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 8,
                    legend: "Doanh thu (VNĐ)",
                    legendOffset: -70,
                    legendPosition: "middle",
                    format: (value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(0)}M`
                        : value >= 1000
                        ? `${(value / 1000).toFixed(0)}K`
                        : value,
                  }}
                  enableGridY={true}
                  gridYValues={5}
                  enableLabel={false}
                  theme={{
                    textColor: "#0f172a",
                    fontSize: 11,
                    grid: {
                      line: {
                        stroke: "#e5e7eb",
                        strokeWidth: 1,
                      },
                    },
                    axis: {
                      ticks: {
                        text: {
                          fill: "#475569",
                          fontSize: 11,
                        },
                      },
                      legend: {
                        text: {
                          fill: "#1e293b",
                          fontSize: 12,
                          fontWeight: 600,
                        },
                      },
                    },
                  }}
                  // Tooltip đẹp với nhiều thông tin
                  tooltip={({ indexValue, data }) => {
                    const employee = data as any;
                    const percent =
                      totalRevenue > 0
                        ? ((employee.revenue / totalRevenue) * 100).toFixed(1)
                        : 0;

                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white shadow" />
                          <span className="font-semibold text-gray-800">
                            {indexValue}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Doanh thu:</span>
                            <span className="font-bold text-gray-900">
                              {employee.revenue.toLocaleString("vi-VN")} VNĐ
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Đơn hàng:</span>
                            <span className="font-semibold text-gray-700">
                              {employee.orders} đơn
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1.5 border-t border-gray-100">
                            <span className="text-gray-600">Tỷ lệ:</span>
                            <span className="font-semibold text-emerald-600">
                              {percent}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }}
                  // Animation
                  animate={true}
                  motionConfig="gentle"
                  isInteractive={true}
                  role="application"
                  ariaLabel="Biểu đồ doanh số nhân viên"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thống kê nhanh */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
        >
          <p className="text-xs text-gray-600 mb-1">Tổng doanh thu</p>
          <p className="text-xl font-bold text-emerald-700">
            {(totalRevenue / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-0.5">VNĐ</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="text-center p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100"
        >
          <p className="text-xs text-gray-600 mb-1">Tổng đơn hàng</p>
          <p className="text-xl font-bold text-sky-700">
            {totalOrders.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">đơn</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100"
        >
          <p className="text-xs text-gray-600 mb-1">TB/nhân viên</p>
          <p className="text-xl font-bold text-amber-700">
            {(totalRevenue / data.length / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-0.5">VNĐ</p>
        </motion.div>
      </div>

      {/* Top performers */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          🏆 Top 3 nhân viên
        </h3>
        <div className="space-y-2">
          {[...data]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3)
            .map((emp, idx) => {
              const percent =
                totalRevenue > 0
                  ? ((emp.amount / totalRevenue) * 100).toFixed(1)
                  : 0;

              return (
                <motion.div
                  key={emp.accountId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        NV {data.indexOf(emp) + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {emp.orderCount} đơn hàng
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {(emp.amount / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">
                      {percent}%
                    </p>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}
