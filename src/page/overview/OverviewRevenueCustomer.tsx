import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sumBy } from "lodash";
import { getMonthNameVI } from "../../utils/convertMonth";

import DealerKPI from "../../components/molecules/overview/KpiCard";
import DealerContractPie from "../../components/organisms/Overview/DealerContractPie";
import DealerCustomerChartWrapper from "../../components/organisms/Overview/DealerCustomerChartWrapper";
import RevenueLineChart from "../../components/organisms/Overview/DealerLineChart";

import { useDealerCustomerReportQuery } from "../../service/overviewRevenueDealer";

/* -------------------------------------------------------------------------- */
/*  Component chính: Trang Dashboard của đại lý                            */
/* -------------------------------------------------------------------------- */
export default function DealerDashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  // Gọi API doanh thu / hợp đồng / xe mua
  const { data, isLoading, isError } = useDealerCustomerReportQuery(
    {},
    { month: selectedMonth, page: 0, size: 50 }
  );

  // Chuẩn hóa dữ liệu - hỗ trợ nhiều format API response
  const rows = useMemo(() => {
    const list = data?.data ?? [];
    return list.map((r: any) => ({
      customerId: r.customerId || r.customerID || r.customer || "",
      totalVehiclesPurchased: r.totalVehiclesPurchased || 0,
      totalRevenue: r.totalRevenue || 0,
      totalContracts: r.totalContracts || 0,
      month: r.month || selectedMonth,
    }));
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

  // KPI cards
  const kpi = [
    {
      title: "Doanh thu",
      value: `${totalRevenue.toLocaleString("vi-VN")} VNĐ`,
      sub: `Tháng ${getMonthNameVI(selectedMonth)}`,
      icon: "💲",
      color: "from-emerald-400 to-teal-500",
    },
    {
      title: "Xe đã bán",
      value: `${totalVehicles.toLocaleString("vi-VN")} xe`,
      sub: `Tháng ${getMonthNameVI(selectedMonth)}`,
      icon: "🚗",
      color: "from-sky-400 to-blue-500",
    },
    {
      title: "Hợp đồng",
      value: `${totalContracts.toLocaleString("vi-VN")} hợp đồng`,
      sub: "Đã ký + Chờ ký",
      icon: "📄",
      color: "from-amber-400 to-orange-500",
    },
    {
      title: "Tăng trưởng",
      value: `${growth.toFixed(1)}%`,
      sub: `So với ${getMonthNameVI(prevMonth)}`,
      icon: growth >= 0 ? "📈" : "📉",
      color:
        growth >= 0
          ? "from-fuchsia-400 to-purple-500"
          : "from-red-400 to-pink-500",
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
          color: "#10b981",
        },
        {
          id: "Chờ ký",
          label: "Chờ ký",
          value: Math.round(totalContracts * 0.25),
          color: "#f87171",
        },
      ],
    };
  }, [rows, totalContracts]);

  /* ------------------------------ Loading / Error ------------------------------ */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <svg
          className="w-20 h-20 text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-red-600 font-semibold text-lg">Lỗi tải dữ liệu!</p>
        <p className="text-gray-500 text-sm mt-2">Vui lòng thử lại sau</p>
      </div>
    );
  }

  /* ------------------------------ Giao diện chính ------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-gray-800 p-6 md:p-10 space-y-10">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Thống kê khách hàng đại lý
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tổng quan doanh thu và hoạt động
          </p>
        </div>
        <select
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {getMonthNameVI(num)}
            </option>
          ))}
        </select>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpi.map((item, i) => (
          <DealerKPI key={i} {...item} />
        ))}
      </div>

      {/* CHARTS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMonth}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="space-y-10"
        >
          {/* Line Chart - Doanh thu theo tháng */}
          <RevenueLineChart data={charts.line} />

          {/* Customer Chart - CHÍNH LÀ NƠI CONVERT ID → NAME */}
          {/* Dùng Wrapper mới có logic convert id → name */}
          <DealerCustomerChartWrapper data={rows} metric="totalRevenue" />

          {/*Pie Chart - Tỷ lệ hợp đồng */}
          <DealerContractPie data={charts.pie} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
