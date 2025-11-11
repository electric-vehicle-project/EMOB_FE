import { useMemo, useState, useEffect } from "react";
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
import DealerContractPie from "../../components/organisms/overview/overviewDealers/DealerContractPie";
import { useDealerCustomerReportQuery } from "../../service/overviewRevenueDealer";
import { formatMoney } from "../../utils/formatMoney";
import RevenueLineChart from "../../components/organisms/overview/overviewDealers/DealerLineChart";
import DealerCustomerChart from "../../components/organisms/overview/overviewCustomers/DealerCustomerChart";

const CURRENT_YEAR = new Date().getFullYear();

/* -------------------------------------------------------------------------- */
/*                     Dashboard: Thống kê khách hàng theo NĂM               */
/* -------------------------------------------------------------------------- */
export default function DealerDashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Gọi API doanh thu theo năm
  const queryResult = useDealerCustomerReportQuery(
    {},
    { year: selectedYear }
  ) as UseQueryResult<CustomerRevenueResponse, unknown>;

  const { data, isLoading, isError, isFetching } = queryResult;

  // Gọi thêm năm trước để tính tăng trưởng
  const { data: lastYearData } = useDealerCustomerReportQuery(
    {},
    { year: selectedYear - 1 }
  );

  // Chuẩn hóa dữ liệu doanh thu
  const rows = useMemo(() => {
    const list = data?.result ?? [];
    return list.map(
      (r: CustomerRevenue & { month?: number; customerId?: string }) => ({
        customerId: r.customerId ?? "",
        month: r.month ?? 0,
        totalRevenue: r.totalRevenue || 0,
        totalContracts: r.totalContracts || 0,
        totalVehiclesSold: r.totalVehiclesSold || 0,
      })
    );
  }, [data]);

  // Lấy danh sách customerIds duy nhất
  const customerIds = useMemo(
    () => Array.from(new Set(rows.map((r) => r.customerId).filter(Boolean))),
    [rows]
  );

  // Fetch danh sách khách hàng trực tiếp
  useEffect(() => {
    async function fetchCustomers() {
      if (customerIds.length === 0) return;

      setLoadingCustomers(true);

      const results = await Promise.all(
        customerIds.map(async (id) => {
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
              name: (name && name.trim()) || `Khách hàng #${id.slice(-6)}`,
            };
          } catch (err) {
            console.error(`lỗi lấy dữ liệu khách hàng ${id}:`, err);
            return { id, name: `Khách hàng #${id.slice(-6)}` };
          }
        })
      );

      setCustomers(results);
      setLoadingCustomers(false);
    }

    fetchCustomers();
  }, [customerIds]);

  // Dữ liệu năm trước
  const lastYearRows = useMemo(
    () => lastYearData?.result ?? [],
    [lastYearData]
  );

  // KPI tổng hợp
  const totalRevenue = sumBy(rows, "totalRevenue");
  const totalContracts = sumBy(rows, "totalContracts");
  const totalVehicles = sumBy(rows, "totalVehiclesSold");
  const lastYearRevenue = sumBy(lastYearRows, "totalRevenue");

  // Tăng trưởng so với năm trước
  const growth =
    lastYearRevenue > 0
      ? ((totalRevenue - lastYearRevenue) / lastYearRevenue) * 100
      : 0;

  // KPI cards
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
      title: "Xe đã mua",
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

  // lấy dữ liệu cho biểu đồ
  const charts = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.month - b.month);
    return {
      line: [
        {
          id: `Doanh thu ${selectedYear}`,
          data: sorted.map((r) => ({
            x: getMonthNameVI(r.month + 1),
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
  }, [rows, totalContracts, selectedYear]);

  // theo tháng
  const enrichedCustomerData = useMemo(() => {
    if (!Array.isArray(rows)) return [];

    return rows.map((r) => ({
      customer: getMonthNameVI(r.month),
      totalRevenue: r.totalRevenue ?? 0,
      totalVehiclesPurchased: r.totalVehiclesSold ?? 0,
    }));
  }, [rows]);

  // Error UI
  if (isError && !data) {
    return (
      <div className="p-8 text-red-500 text-center bg-white">
        Lỗi tải dữ liệu từ API!
      </div>
    );
  }

  /* ------------------------------ UI chính ------------------------------ */
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
          Tổng quan Khách hàng Đại lý
        </h1>
        <p className="text-gray-600">
          Theo dõi và phân tích doanh thu, hợp đồng, xe mua theo năm
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
          {/* YEAR */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#627254]" />
              <select
                className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 py-2.5 shadow-sm hover:border-[#627254] focus:outline-none focus:border-[#627254] focus:ring-2 focus:ring-[#627254]/20 transition-all"
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
        </div>
      </motion.div>

      {/* KPI + Charts */}
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpi.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 24px rgba(98,114,84,0.2)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="rounded-2xl"
              >
                <DealerKPI {...item} />
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedYear}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Line chart */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="lg:col-span-2"
              >
                <RevenueLineChart data={charts.line} region="" />
              </motion.div>

              {/* Customer chart */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
              >
                <DealerCustomerChart
                  data={enrichedCustomerData.map((d) => ({
                    customer: d.customer,
                    value: d.totalRevenue,
                  }))}
                  metric="totalRevenue"
                  title={
                    loadingCustomers
                      ? "Đang tải tên khách hàng..."
                      : "Doanh thu khách hàng theo tháng"
                  }
                />
              </motion.div>

              {/* Pie chart */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
              >
                <DealerContractPie data={charts.pie} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
