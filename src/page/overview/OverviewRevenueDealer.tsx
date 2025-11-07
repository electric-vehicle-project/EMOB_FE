import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealerReportQuery } from "../../service/overviewRevenueDealer";
import { getMonthNameVI } from "../../utils/convertMonth";
import { sumBy } from "lodash";
import DealerKPI from "../../components/molecules/overview/KpiCard";
import DealerContractPie from "../../components/organisms/Overview/DealerContractPie";
import RevenueLineChart from "../../components/organisms/Overview/DealerLineChart";
import DealerSalesChart from "../../components/organisms/Overview/DealerSaleChart";

export const REGIONS = ["NORTH", "CENTRAL", "SOUTH"];

export default function CarBrandDealerDashboard() {
  const [selectedRegion, setSelectedRegion] =
    useState<string>("Tất cả khu vực");
  const [selectedDealer, setSelectedDealer] = useState<string>("Tất cả đại lý");
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  // call api
  const { data, isLoading, isError } = useDealerReportQuery(
    {},
    {
      month: selectedMonth,
      region: selectedRegion === "Tất cả khu vực" ? undefined : selectedRegion,
      dealerId: selectedDealer === "Tất cả đại lý" ? undefined : selectedDealer,
    }
  );

  const rows = Array.isArray(data?.data) ? data.data : [];

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

  // KPI list
  const kpi = [
    {
      title: "Doanh thu",
      value: `${totalRevenue.toLocaleString("vi-VN")} USD`,
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
      icon: "📈",
      color: "from-fuchsia-400 to-purple-500",
    },
  ];

  // Trạng thái tải
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <motion.div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-red-500 text-center bg-white">
        Lỗi tải dữ liệu từ API!
      </div>
    );

  // Giao diện chính
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800 p-6 md:p-10 space-y-8">
      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-3">
        {/* REGION */}
        <select
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm hover:shadow focus:outline-none"
          value={selectedRegion}
          onChange={(e) => {
            setSelectedRegion(e.target.value);
            setSelectedDealer("Tất cả đại lý");
          }}
        >
          <option>Tất cả khu vực</option>
          {REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        {/* DEALER */}
        <select
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm hover:shadow focus:outline-none"
          value={selectedDealer}
          onChange={(e) => setSelectedDealer(e.target.value)}
          disabled={selectedRegion === "Tất cả khu vực"}
        >
          <option>Tất cả đại lý</option>
          {dealerList.map((d) => (
            <option key={d.id}>{d.name}</option>
          ))}
        </select>

        {/* MONTH */}
        <select
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm hover:shadow focus:outline-none"
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

      {/* KPI + Biểu đồ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedRegion}-${selectedDealer}-${selectedMonth}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpi.map((item, i) => (
              <DealerKPI key={i} {...item} />
            ))}
          </div>

          {/* Biểu đồ */}
          <RevenueLineChart
            data={charts.line}
            region={selectedRegion}
            dealer={selectedDealer}
          />
          <DealerSalesChart data={charts.bar} region={selectedRegion} />
          <DealerContractPie data={charts.pie} />
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="text-xs text-gray-500 mt-8 text-center">
        © {new Date().getFullYear()} Hệ thống báo cáo đại lý khu vực
      </div>
    </div>
  );
}
