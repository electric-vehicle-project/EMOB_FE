import { useState, useMemo, useEffect } from "react";
import { Select, message } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";
import { useSaleOrdersOfDealers } from "../../service/saleOrderService";
import { useGetAccountsByManager } from "../../service/accountService"; // để lấy danh sách đại lý
import { mapDealerOptions } from "../../utils/mapToSelectOptions";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderFilterBar } from "../../components/organisms/saleOrder/SaleOrderFilterBar";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";

const SaleOrderEvmPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const role = (user as any)?.role ?? "EVM_STAFF";

  // ==============================
  // State
  // ==============================
  const [dealerId, setDealerId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<string>("desc");

  // ==============================
  // Fetch dealer list
  // ==============================
  const { data: dealerData } = useGetAccountsByManager(0, 50, {
    enabled: true,
  });
  const dealerOptions = mapDealerOptions(dealerData);

  // ==============================
  // Query params
  // ==============================
  const params = useMemo(() => {
    const statuses = statusFilter === "ALL" ? undefined : [statusFilter];
    return {
      page: 0,
      size: 10,
      dealerId,
      statuses,
      sortField,
      sortDir,
    };
  }, [dealerId, statusFilter, sortField, sortDir]);

  // ==============================
  // Fetch sale orders
  // ==============================
  const { data, isLoading, isFetching, refetch, error } =
    useSaleOrdersOfDealers({}, params);

  const orders: SaleOrderResponse[] =
    ((data as any)?.result?.data as SaleOrderResponse[]) ?? [];

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId, statusFilter, sortField, sortDir]);

  // ==============================
  // Filter summary
  // ==============================
  const statusCounts = useMemo(() => {
    const counts = { all: 0, created: 0, completed: 0, canceled: 0 };
    orders.forEach((o) => {
      counts.all++;
      if (o.status === "CREATED") counts.created++;
      else if (o.status === "COMPLETED") counts.completed++;
      else if (o.status === "CANCELED") counts.canceled++;
    });
    return counts;
  }, [orders]);

  // ==============================
  // Handlers
  // ==============================
  const handleViewDetail = (id: string) => {
    const base = `/${String(role || "").toLowerCase()}`;
    navigate(`${base}/sale-orders/${id}`, { replace: false });
  };

  if (error) {
    message.error("Không thể tải dữ liệu đơn hàng của đại lý!");
  }

  // ==============================
  // Render
  // ==============================
  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quản lý đơn hàng của các đại lý
        </h2>
        <Select
          placeholder="Chọn đại lý"
          style={{ width: 250 }}
          allowClear
          options={dealerOptions}
          onChange={(value) => setDealerId(value || undefined)}
        />
      </div>

      <SaleOrderFilterBar
        counts={statusCounts}
        defaultStatus={statusFilter}
        onStatusChange={(s) => setStatusFilter(s)}
      />

      <SaleOrderTable
        key={`orders-${dealerId}-${statusFilter}-${sortField}-${sortDir}`}
        data={orders}
        loading={isLoading || isFetching}
        showDealerColumn
        onViewDetail={handleViewDetail}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortDir(order);
        }}
      />
    </CardWrapper>
  );
};

export default SaleOrderEvmPage;
export { SaleOrderEvmPage };
