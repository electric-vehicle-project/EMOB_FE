import { useEffect, useMemo, useState } from "react";
import { Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderByStaffTable } from "../../components/organisms/saleOrder/SaleOrderByStaffTable";
import { useSalesByStaff } from "../../service/saleOrderService";
import { useGetAccountsByManager } from "../../service/accountService";
import { mapToSelectOptions } from "../../utils/mapToSelectOptions";
import type { SalesByStaffResponse } from "../../model/SaleOrder";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const SaleOrderByStaffPage: React.FC = () => {
  const navigate = useNavigate();

  const [sortField, setSortField] =
    useState<keyof SalesByStaffResponse>("amount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const params = useMemo(
    () => ({
      page: 0,
      size: 10,
      sortField,
      sortDir,
    }),
    [sortField, sortDir]
  );

  const { data, isLoading, isFetching, refetch, isError } =
    useSalesByStaff(params);

  const { data: accountsData } = useGetAccountsByManager({
    page: 0,
    size: 50,
  });

  const accountOptions = mapToSelectOptions(accountsData, "fullName", "id");

  useEffect(() => {
    if (isError) toast.error("Không thể tải dữ liệu doanh số!");
  }, [isError]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortDir]);

  const staffSales: SalesByStaffResponse[] = useMemo(() => {
    const raw = data?.result?.data ?? data?.data ?? [];
    return raw.map((s: SalesByStaffResponse, index: number) => {
      const matched =
        accountOptions.find((a) => a.value === s.accountId)?.label ??
        `Nhân viên ${index + 1}`;
      return { ...s, staffName: matched };
    });
  }, [data, accountOptions]);

  return (
    <CardWrapper
      title="Doanh số theo nhân viên"
      subtitle="Theo dõi hiệu suất bán hàng của từng nhân viên"
      variant="dashboard"
      rightLink={
        <b
          className="text-green-600 underline hover:text-green-800 text-sm cursor-pointer"
          onClick={() => navigate("/manager/sale-order")}
        >
          Xem đơn hàng của đại lý
        </b>
      }
    >
      <div className="relative">
        <AnimatePresence>
          {(isLoading || isFetching) && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-md"
            >
              <Spin size="large" tip="Đang tải dữ liệu..." />
            </motion.div>
          )}
        </AnimatePresence>

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
      </div>
    </CardWrapper>
  );
};

export default SaleOrderByStaffPage;
export { SaleOrderByStaffPage };
