import { useEffect, useMemo, useState } from "react";
import { message, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderByStaffTable } from "../../components/organisms/saleOrder/SaleOrderByStaffTable";
import { useSalesByStaff } from "../../service/saleOrderService";
import { useGetAccountsByManager } from "../../service/accountService";
import { mapToSelectOptions } from "../../utils/mapToSelectOptions";
import type { SalesByStaffResponse } from "../../model/SaleOrder";
import { toast } from "react-toastify";

const SaleOrderByStaffPage: React.FC = () => {
  // ==============================
  // 🔍 State: Sắp xếp
  // ==============================
  const [sortField, setSortField] =
    useState<keyof SalesByStaffResponse>("amount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ==============================
  // ⚙️ Query Params
  // ==============================
  const params = useMemo(
    () => ({
      page: 0,
      size: 10,
      sortField,
      sortDir,
    }),
    [sortField, sortDir]
  );

  // ==============================
  // 📦 API: Doanh số nhân viên
  // ==============================
  const { data, isLoading, isFetching, refetch, isError } =
    useSalesByStaff(params);

  // ==============================
  // 👤 API: Danh sách nhân viên
  // ==============================
  const { data: accountsData } = useGetAccountsByManager(0, 50);
  const accountOptions = mapToSelectOptions(accountsData, "fullName", "id");

  // ==============================
  // 🚨 Xử lý lỗi
  // ==============================
  useEffect(() => {
    if (isError) toast.error("Không thể tải dữ liệu doanh số!");
  }, [isError]);

  // ==============================
  // 🔄 Refetch khi sort thay đổi
  // ==============================
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortDir]);

  // ==============================
  // 🧩 Mapping dữ liệu hiển thị
  // ==============================
  const staffSales: SalesByStaffResponse[] = useMemo(() => {
    const raw = data?.result?.data ?? data?.data ?? [];
    return raw.map((s: SalesByStaffResponse, index: number) => {
      const matched =
        accountOptions.find((a) => a.value === s.accountId)?.label ??
        `Nhân viên ${index + 1}`;
      return { ...s, staffName: matched };
    });
  }, [data, accountOptions]);

  // ==============================
  // 🖼️ Render UI (hiệu ứng kết hợp)
  // ==============================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-10"
    >
      <CardWrapper className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg p-6">
        {/* Hiệu ứng nền */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#627254]/10 to-transparent rounded-full blur-3xl -z-0" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-[#627254] to-[#76885b] rounded-full" />
              <h2 className="text-2xl font-bold text-[#627254] flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#627254]" />
                Doanh số theo nhân viên
              </h2>
            </div>
            <p className="text-gray-600 text-sm mt-1 ml-5">
              Theo dõi hiệu suất bán hàng của từng nhân viên, bao gồm doanh thu
              và số lượng đơn hàng.
            </p>
          </div>
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {(isLoading || isFetching) && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
            >
              <Spin size="large" tip="Đang tải dữ liệu..." />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative z-10"
        >
          <SaleOrderByStaffTable
            data={staffSales}
            loading={isLoading || isFetching}
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={(field, order) => {
              setSortField(field);
              setSortDir(order);
            }}
          />
        </motion.div>
      </CardWrapper>
    </motion.div>
  );
};

export default SaleOrderByStaffPage;
export { SaleOrderByStaffPage };
