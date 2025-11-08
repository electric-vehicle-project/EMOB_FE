import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealerReportQuery } from "../../service/overviewRevenueDealer";
import { getMonthNameVI } from "../../utils/convertMonth";
import { sumBy } from "lodash";
import { DollarSign, Car, FileText, TrendingUp, Filter } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { DealerApiResponse } from "../../model/Overview";
import DealerKPI from "../../components/molecules/overview/KpiCard";
import DealerContractPie from "../../components/organisms/Overview/DealerContractPie";
import RevenueLineChart from "../../components/organisms/Overview/DealerLineChart";
import DealerSalesChart from "../../components/organisms/Overview/DealerSaleChart";
import { formatMoney } from "../../utils/formatMoney";

const REGIONS = ["NORTH", "CENTRAL", "SOUTH"];

export default function CarBrandDealerDashboard() {
  const [selectedRegion, setSelectedRegion] =
    useState<string>("Tất cả khu vực");
  const [selectedDealer, setSelectedDealer] = useState<string>("Tất cả đại lý");
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  // call api
  const queryResult = useDealerReportQuery(
    {},
    {
      month: selectedMonth,
      region: selectedRegion === "Tất cả khu vực" ? undefined : selectedRegion,
      dealerId: selectedDealer === "Tất cả đại lý" ? undefined : selectedDealer,
    }
  ) as UseQueryResult<DealerApiResponse, unknown>;
  const { data, isLoading, isError, isFetching } = queryResult;

  const rows = useMemo(() => {
    return Array.isArray(data?.data) ? data.data : [];
  }, [data?.data]);

  // Lấy danh sách đại lý theo khu vực
  const dealerList = useMemo(() => {
    if (selectedRegion === "Tất cả khu vực") return [];
    const uniqueDealers = Array.from(
      new Set(
        rows.map((r) => JSON.stringify({ id: r.dealerId, name: r.country }))
      )
    ).map((s) => JSON.parse(s));
    return uniqueDealers;
  }, [rows, selectedRegion]);

  // Tính toán KPI
  const totalRevenue = sumBy(rows, "totalRevenue") || 0;
  const totalContracts = sumBy(rows, "totalContracts") || 0;
  const totalVehicles = sumBy(rows, "totalVehiclesSold") || 0;

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

  // chart data
  const charts = useMemo(() => {
    if (!rows.length) return { line: [], bar: [], pie: [] };
    const sortedRows = [...rows].sort((a, b) => a.month - b.month);

    return {
      line: [
        {
          id:
            selectedDealer !== "Tất cả đại lý"
              ? `Doanh thu – ${selectedDealer}`
              : selectedRegion !== "Tất cả khu vực"
              ? `Doanh thu – ${selectedRegion}`
              : "Tổng doanh thu",
          data: sortedRows.map((r) => ({
            x: getMonthNameVI(r.month),
            y: r.totalRevenue ?? 0,
          })),
        },
      ],
      bar: sortedRows.map((r) => ({
        dealer: r.country || "N/A",
        cars: r.totalVehiclesSold ?? 0,
      })),
      pie: [
        { id: "Đã ký", value: totalContracts },
        { id: "Chờ ký", value: Math.round(totalContracts * 0.25) },
      ],
    };
  }, [rows, selectedRegion, selectedDealer, totalContracts]);

  // KPI list với màu chủ đạo và icons
  const kpi = [
    {
      title: "Doanh thu",
      value: `${formatMoney(totalRevenue)} `,
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
      gradient: "from-[#76885b] to-[#9fb87a]",
      bgGradient: "from-[#76885b]/10 to-[#9fb87a]/10",
    },
  ];

  if (isError && !data) {
    return (
      <div className="p-8 text-red-500 text-center bg-white">
        Lỗi tải dữ liệu từ API!
      </div>
    );
  }

  // Giao diện chính
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
          Tổng quan Doanh thu Đại lý
        </h1>
        <p className="text-gray-600">
          Theo dõi và phân tích hiệu suất kinh doanh theo khu vực và đại lý
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
          {/* REGION */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khu vực
            </label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-[#627254] focus:outline-none focus:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all"
              value={selectedRegion}
              onChange={(e) => {
                const newRegion = e.target.value;
                setSelectedRegion(newRegion);
                // Chỉ reset dealer khi region thay đổi, không trigger re-render toàn bộ
                if (
                  newRegion === "Tất cả khu vực" ||
                  selectedDealer !== "Tất cả đại lý"
                ) {
                  setSelectedDealer("Tất cả đại lý");
                }
              }}
            >
              <option>Tất cả khu vực</option>
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* DEALER */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đại lý
            </label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-[#627254] focus:outline-none focus:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedDealer}
              onChange={(e) => setSelectedDealer(e.target.value)}
              disabled={selectedRegion === "Tất cả khu vực"}
            >
              <option>Tất cả đại lý</option>
              {dealerList.map((d) => (
                <option key={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* MONTH */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-[#627254] focus:outline-none focus:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all"
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
      </motion.div>

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
                key={`${selectedRegion}-${selectedMonth}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Line Chart */}
                <div className="lg:col-span-2">
                  <RevenueLineChart
                    data={charts.line}
                    region={selectedRegion}
                    dealer={selectedDealer}
                  />
                </div>

                {/* Bar Chart */}
                <DealerSalesChart data={charts.bar} region={selectedRegion} />

                {/* Pie Chart */}
                <DealerContractPie data={charts.pie} />
              </motion.div>
            </AnimatePresence>
          </div>
        )
      }
      {/* KPI + Biểu đồ */}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-gray-500 mt-8 text-center"
      >
        © {new Date().getFullYear()} Hệ thống báo cáo đại lý khu vực
      </motion.div>
    </div>
  );
}
