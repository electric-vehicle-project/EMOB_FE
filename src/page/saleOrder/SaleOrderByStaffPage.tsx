import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderByStaffTable } from "../../components/organisms/saleOrder/SaleOrderByStaffTable";

import { useSalesByStaff } from "../../service/saleOrderService";
import { useGetAccountsByManager } from "../../service/accountService";
import { mapToSelectOptions } from "../../utils/mapToSelectOptions";
import type { SalesByStaffResponse } from "../../model/SaleOrder";

// ==============================
// 📊 Trang thống kê doanh số theo nhân viên
// ==============================
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
    if (isError) message.error("Không thể tải dữ liệu doanh số!");
  }, [isError]);

  // ==============================
  // 🔄 Refetch khi sắp xếp thay đổi
  // ==============================
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortDir]);

  // ==============================
  // 🧩 Ánh xạ dữ liệu hiển thị
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
  // 🖼️ Render UI
  // ==============================
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
        sortField={sortField}
        sortDir={sortDir}
        // ✅ Đồng bộ prop onSortChange với table (chuẩn)
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
