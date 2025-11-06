import { useEffect, useMemo, useState } from "react";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useSalesByStaffSummary } from "../../service/saleOrderService";
import { useGetAccountsByManager } from "../../service/accountService";
import { SaleOrderByStaffTable } from "../../components/organisms/saleOrder/SaleOrderByStaffTable";
import { message } from "antd";
import { mapToSelectOptions } from "../../utils/mapToSelectOptions";

const SaleOrderByStaffPage: React.FC = () => {
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ========================
  // Query Params
  // ========================
  const params = useMemo(
    () => ({ page: 0, size: 10, sortField, sortDir }),
    [sortField, sortDir]
  );

  // ========================
  // API Calls
  // ========================
  const { data, isLoading, isFetching, refetch, isError } =
    useSalesByStaffSummary({}, params);

  const { data: accountsData } = useGetAccountsByManager(0, 50);
  const accountOptions = mapToSelectOptions(accountsData, "fullName", "id");

  // ========================
  // Effects
  // ========================
  useEffect(() => {
    if (isError) message.error("Không thể tải dữ liệu doanh số!");
  }, [isError]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortDir]);

  // ========================
  // Mapping Data
  // ========================
  const staffSales = ((data as any)?.result?.data ?? []).map(
    (s: any, index: number) => {
      const matched =
        accountOptions.find((a) => a.value === s.accountId)?.label ??
        `Nhân viên ${index + 1}`;
      return {
        ...s,
        staffName: matched,
      };
    }
  );

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Doanh số theo nhân viên
        </h2>
      </div>

      <SaleOrderByStaffTable
        data={staffSales}
        loading={isLoading || isFetching}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortDir(order);
        }}
      />
    </CardWrapper>
  );
};

export default SaleOrderByStaffPage;
export { SaleOrderByStaffPage };
