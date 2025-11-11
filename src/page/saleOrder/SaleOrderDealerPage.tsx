import { useEffect, useMemo, useState } from "react";
import { message, Button } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrderListCurrentDealer,
  useSaleOrderDelete,
} from "../../service/saleOrderService";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderFilterBar } from "../../components/organisms/saleOrder/SaleOrderFilterBar";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { SaleOrderCancelConfirm } from "../../components/organisms/saleOrder/SaleOrderCancelConfirm";

// ROLE TYPE CHUẨN
type DealerRole = "MANAGER" | "DEALER_STAFF";

const SaleOrderDealerPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const role = user?.role as DealerRole | undefined;

  // State
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrderResponse | null>(
    null
  );
  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Query Params

  const params = useMemo(() => {
    const statuses = statusFilter === "ALL" ? undefined : [statusFilter];
    return { page: 0, size: 10, statuses, sortField, sortDir };
  }, [statusFilter, sortField, sortDir]);

  // Fetch Data

  const { data, isLoading, isFetching, refetch } =
    useSaleOrderListCurrentDealer(params);

  const orders: SaleOrderResponse[] = data?.result?.data ?? data?.data ?? [];

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortField, sortDir]);

  // Summary for Filter Bar

  const statusCounts = useMemo(() => {
    const counts = { all: 0, created: 0, completed: 0, canceled: 0 };
    for (const o of orders) {
      counts.all++;
      if (o.status === "CREATED") counts.created++;
      else if (o.status === "COMPLETED") counts.completed++;
      else if (o.status === "CANCELED") counts.canceled++;
    }
    return counts;
  }, [orders]);

  // Mutations

  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();

  // Handlers

  const handleViewDetail = (id: string) => {
    const base = `/${role?.toLowerCase()}`;
    navigate(`${base}/sale-order/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;
    setSelectedOrder(target);
    setConfirmCancelOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    try {
      await cancelOrder(selectedOrder.id);
      message.success("Đã hủy đơn hàng thành công!");
      refetch();
    } catch {
      message.error("Không thể hủy đơn hàng này!");
    } finally {
      setConfirmCancelOpen(false);
    }
  };

  // Render

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Đơn hàng của đại lý
        </h2>

        {role === "MANAGER" ? (
          <Button
            onClick={() => navigate("/manager/sale-order/staff-summary")}
            type="primary"
          >
            Xem doanh số theo nhân viên
          </Button>
        ) : role === "DEALER_STAFF" ? (
          <Button
            onClick={() => navigate("/dealer_staff/sale-order/staff")}
            type="primary"
          >
            Xem các đơn hàng của tôi
          </Button>
        ) : null}
      </div>

      <SaleOrderFilterBar
        counts={statusCounts}
        defaultStatus={statusFilter}
        onStatusChange={(s) => setStatusFilter(s)}
      />

      <SaleOrderTable
        key={`orders-${statusFilter}-${sortField}-${sortDir}`}
        data={orders}
        loading={isLoading || isFetching}
        onDelete={handleDeleteClick}
        onViewDetail={handleViewDetail}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortDir(order);
        }}
      />

      <SaleOrderCancelConfirm
        open={confirmCancelOpen}
        orderId={selectedOrder?.id}
        onCancel={() => setConfirmCancelOpen(false)}
        onConfirm={handleDelete}
        loading={canceling}
      />
    </CardWrapper>
  );
};

export default SaleOrderDealerPage;
export { SaleOrderDealerPage };
