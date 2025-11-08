import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sumBy } from "lodash";
import { getMonthNameVI } from "../../utils/convertMonth";
import {
  DollarSign,
  Car,
  FileText,
  TrendingUp,
  Filter,
  Calendar,
} from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type {
  CustomerRevenueResponse,
  CustomerRevenue,
} from "../../model/Overview";
import DealerKPI from "../../components/molecules/overview/KpiCard";
import DealerContractPie from "../../components/organisms/Overview/DealerContractPie";
import DealerCustomerChartWrapper from "../../components/organisms/Overview/DealerCustomerChartWrapper";
import RevenueLineChart from "../../components/organisms/Overview/DealerLineChart";
import { useDealerCustomerReportQuery } from "../../service/overviewRevenueDealer";
import { formatMoney } from "../../utils/formatMoney";

/* -------------------------------------------------------------------------- */
/*  Component chính: Trang Dashboard của đại lý                            */
/* -------------------------------------------------------------------------- */
export default function DealerDashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  // Gọi API doanh thu / hợp đồng / xe mua
  const queryResult = useDealerCustomerReportQuery(
    {},
    { month: selectedMonth, page: 0, size: 50 }
  ) as UseQueryResult<CustomerRevenueResponse, unknown>;
  const { data, isLoading, isError, isFetching } = queryResult;

  // Chuẩn hóa dữ liệu - hỗ trợ nhiều format API response
  const rows = useMemo(() => {
    const list = data?.data ?? [];
    return list.map(
      (r: CustomerRevenue & { customerID?: string; customer?: string }) => ({
        customerId: r.customerId || r.customerID || r.customer || "",
        totalVehiclesPurchased: r.totalVehiclesPurchased || 0,
        totalRevenue: r.totalRevenue || 0,
        totalContracts: r.totalContracts || 0,
        month: r.month || selectedMonth,
      })
    );
  }, [data, selectedMonth]);

  //KPI tổng
  const totalRevenue = sumBy(rows, "totalRevenue");
  const totalContracts = sumBy(rows, "totalContracts");
  const totalVehicles = sumBy(rows, "totalVehiclesPurchased");

  // tính tăng trưởng so với tháng trước
  const prevMonth = selectedMonth > 1 ? selectedMonth - 1 : 1;
  const revenueNow = sumBy(
    rows.filter((r) => r.month === selectedMonth),
    "totalRevenue"
  );
  const revenuePrev = sumBy(
    rows.filter((r) => r.month === prevMonth),
    "totalRevenue"
  );
  const growth =
    revenuePrev > 0 ? ((revenueNow - revenuePrev) / revenuePrev) * 100 : 0;

  // KPI cards với màu chủ đạo và icons
  const kpi = [
    {
      title: "Doanh thu",
      value: `${formatMoney(totalRevenue)}`,
      sub: `Tháng ${getMonthNameVI(selectedMonth)}`,
      icon: DollarSign,
      gradient: "from-[#627254] to-[#76885b]",
      bgGradient: "from-[#627254]/10 to-[#76885b]/10",
    },
    {
      title: "Xe đã bán",
      value: `${totalVehicles.toLocaleString("vi-VN")} xe`,
      sub: `Tháng ${getMonthNameVI(selectedMonth)}`,
      icon: Car,
      gradient: "from-[#525e46] to-[#627254]",
      bgGradient: "from-[#525e46]/10 to-[#627254]/10",
    },
    {
      title: "Hợp đồng",
      value: `${totalContracts.toLocaleString("vi-VN")} hợp đồng`,
      sub: "Đã ký + Chờ ký",
      icon: FileText,
      gradient: "from-[#627254] to-[#8a9d6f]",
      bgGradient: "from-[#627254]/10 to-[#8a9d6f]/10",
    },
    {
      title: "Tăng trưởng",
      value: `${growth.toFixed(1)}%`,
      sub: `So với ${getMonthNameVI(prevMonth)}`,
      icon: TrendingUp,
      gradient:
        growth >= 0
          ? "from-[#76885b] to-[#9fb87a]"
          : "from-[#d97706] to-[#f59e0b]",
      bgGradient:
        growth >= 0
          ? "from-[#76885b]/10 to-[#9fb87a]/10"
          : "from-[#d97706]/10 to-[#f59e0b]/10",
    },
  ];

  // Chuẩn bị dữ liệu cho các biểu đồ
  const charts = useMemo(() => {
    if (!rows.length) return { line: [], pie: [] };

    const sorted = [...rows].sort((a, b) => a.month - b.month);

    return {
      line: [
        {
          id: "Doanh thu theo tháng",
          data: sorted.map((r) => ({
            x: getMonthNameVI(r.month),
            y: r.totalRevenue,
          })),
        },
      ],
      pie: [
        {
          id: "Đã ký",
          label: "Đã ký",
          value: Math.round(totalContracts * 0.75),
          color: "#627254",
        },
        {
          id: "Chờ ký",
          label: "Chờ ký",
          value: Math.round(totalContracts * 0.25),
          color: "#76885b",
        },
      ],
    };
  }, [rows, totalContracts]);

  /* ------------------------------ Loading / Error ------------------------------ */
  if (isError && !data) {
    return (
      <div className="p-8 text-red-500 text-center bg-white">
        Lỗi tải dữ liệu từ API!
      </div>
    );
  }

  /* ------------------------------ Giao diện chính ------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 p-6 md:p-10 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-[#627254] mb-2">
          Thống kê Khách hàng Đại lý
        </h1>
        <p className="text-gray-600">
          Tổng quan doanh thu và hoạt động mua hàng của khách hàng
        </p>
      </motion.div>

      {/* Bộ lọc - Block riêng */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#627254]" />
          <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* MONTH */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#627254]" />
              <select
                className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 py-2.5 shadow-sm hover:border-[#627254] focus:outline-none focus:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {getMonthNameVI(num)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI + Biểu đồ */}
      {
        // Trạng thái tải - chỉ hiển thị loading toàn trang khi chưa có data lần đầu
        isLoading && !data ? (
          <div className="flex items-center justify-center h-screen bg-white">
            <motion.div className="w-10 h-10 border-4 border-[#627254] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 relative">
            {/* Loading overlay - chỉ hiển thị khi đang fetch, không block UI */}
            {isFetching && data && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-12 h-12 border-4 border-[#627254] border-t-transparent rounded-full animate-spin"
                />
              </div>
            )}

            {/* KPI Cards - Block riêng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {kpi.map((item, i) => (
                <DealerKPI key={i} {...item} />
              ))}
            </div>

            {/* Biểu đồ - Mỗi biểu đồ là 1 block riêng */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMonth}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Line Chart - Doanh thu theo tháng */}
                <div className="lg:col-span-2">
                  <RevenueLineChart data={charts.line} region="" dealer="" />
                </div>

                {/* Customer Chart - CHÍNH LÀ NƠI CONVERT ID → NAME */}
                <DealerCustomerChartWrapper data={rows} metric="totalRevenue" />

                {/* Pie Chart - Tỷ lệ hợp đồng */}
                <DealerContractPie data={charts.pie} />
              </motion.div>
            </AnimatePresence>
          </div>
        )
      }

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-gray-500 mt-8 text-center"
      >
        © {new Date().getFullYear()} Hệ thống báo cáo khách hàng đại lý
      </motion.div>
    </div>
  );
}
