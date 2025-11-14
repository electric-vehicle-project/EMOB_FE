import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealerReportQuery } from "../../service/overviewRevenueDealer";
import { getMonthNameVI } from "../../utils/convertMonth";
import { sumBy } from "lodash";
import { DollarSign, Car, FileText, TrendingUp, Filter } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { DealerApiResponse } from "../../model/Overview";
import DealerKPI from "../../components/molecules/overview/KpiCard";
import DealerContractPie from "../../components/organisms/overview/overviewDealers/DealerContractPie";
import DealerSalesChart from "../../components/organisms/overview/overviewDealers/DealerSaleChart";
import { formatMoney } from "../../utils/formatMoney";
import RevenueLineChart from "../../components/organisms/overview/overviewDealers/DealerLineChart";

const REGION_MAP = [
  { vi: "Miền Bắc", en: "NORTH" },
  { vi: "Miền Trung", en: "CENTRAL" },
  { vi: "Miền Nam", en: "SOUTH" },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function CarBrandDealerDashboard() {
  const [selectedRegion, setSelectedRegion] = useState("Tất cả khu vực");
  const [selectedCountry, setSelectedCountry] = useState("Tất cả thành phố");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  // call api theo năm
  const queryResult = useDealerReportQuery(
    {},
    {
      year: selectedYear,
      region:
        selectedRegion === "Tất cả khu vực"
          ? undefined
          : REGION_MAP.find((r) => r.vi === selectedRegion)?.en,
      country:
        selectedCountry === "Tất cả thành phố" ? undefined : selectedCountry,
    }
  ) as UseQueryResult<DealerApiResponse, unknown>;

  // lấy doanh năm trước tính
  const { data: lastYearData } = useDealerReportQuery(
    {},
    { year: selectedYear - 1 }
  );

  const { data, isLoading, isError, isFetching } = queryResult;

  // API trả về result, không phải data.data
  const rows = useMemo(() => {
    return Array.isArray(data?.result) ? data.result : [];
  }, [data?.result]);

  // KPI tổng hợp
  const totalRevenue = sumBy(rows, "totalRevenue") || 0;
  const lastYearRevenue = sumBy(lastYearData?.data, "totalRevenue") || 0;
  const totalContracts = sumBy(rows, "totalContracts") || 0;
  const totalVehicles = sumBy(rows, "totalVehiclesSold") || 0;

  // so sánh năm này với năm trước
  const growth =
    lastYearRevenue > 0
      ? ((totalRevenue - lastYearRevenue) / lastYearRevenue) * 100
      : 0;
  // Dữ liệu biểu đồ
  const charts = useMemo(() => {
    const sortedRows = [...rows].sort((a, b) => a.month - b.month);
    return {
      line: [
        {
          id: `Doanh thu ${selectedYear}`,
          data: sortedRows.map((r) => ({
            x: getMonthNameVI(r.month + 1),
            y: r.totalRevenue ?? 0,
          })),
        },
      ],
      bar: sortedRows.map((r) => ({
        dealer: getMonthNameVI(r.month),
        cars: r.totalVehiclesSold ?? 0,
      })),
      pie: [
        { id: "Đã ký", value: totalContracts },
        { id: "Chờ ký", value: Math.round(totalContracts * 0.25) },
      ],
    };
  }, [rows, selectedYear, totalContracts]);

  // KPI Cards
  const kpi = [
    {
      title: "Doanh thu",
      value: `${formatMoney(totalRevenue)}`,
      sub: `Năm ${selectedYear}`,
      icon: DollarSign,
      gradient: "from-[#627254] to-[#76885b]",
      bgGradient: "from-[#627254]/10 to-[#76885b]/10",
    },
    {
      title: "Xe đã bán",
      value: `${totalVehicles.toLocaleString("vi-VN")} xe`,
      sub: `Năm ${selectedYear}`,
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
      sub:
        lastYearRevenue > 0
          ? `So với năm ${selectedYear - 1}`
          : "Không có dữ liệu năm trước",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 p-6 md:p-10 space-y-6">
      {/* Header */}
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
          Theo dõi và phân tích hiệu suất kinh doanh theo khu vực, đại lý và năm
        </p>
      </motion.div>

      {/* Bộ lọc */}
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
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all"
              value={selectedRegion}
              onChange={(e) => {
                const newRegion = e.target.value;
                setSelectedRegion(newRegion);
                if (
                  newRegion === "Tất cả khu vực" ||
                  selectedCountry !== "Tất cả thành phố"
                ) {
                  setSelectedCountry("Tất cả thành phố");
                }
              }}
            >
              <option>Tất cả khu vực</option>
              {REGION_MAP.map((r) => (
                <option key={r.en}>{r.vi}</option>
              ))}
            </select>
          </div>

          {/* DEALER */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thành phố
            </label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={selectedRegion === "Tất cả khu vực"}
            >
              <option>Tất cả thành phố</option>
            </select>
          </div>

          {/* YEAR */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm
            </label>
            <select
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Dữ liệu */}
      {isLoading && !data ? (
        <div className="flex items-center justify-center h-screen bg-white">
          <motion.div className="w-10 h-10 border-4 border-[#627254] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 relative">
          {isFetching && data && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-12 h-12 border-4 border-[#627254] border-t-transparent rounded-full animate-spin"
              />
            </div>
          )}

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpi.map((item, i) => (
              <DealerKPI key={i} {...item} />
            ))}
          </div>

          {/* Charts */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedRegion}-${selectedYear}`}
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
                  country={selectedCountry}
                />
              </div>

              {/* Bar Chart */}
              <DealerSalesChart data={charts.bar} region={selectedRegion} />

              {/* Pie Chart */}
              <DealerContractPie data={charts.pie} />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

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
