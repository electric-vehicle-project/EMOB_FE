import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrdersOfCurrentDealer,
  useSaleOrderDelete,
  useSaleOrderComplete,
} from "../../service/saleOrderService";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderFilterBar } from "../../components/organisms/saleOrder/SaleOrderFilterBar";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { SaleOrderCancelConfirm } from "../../components/organisms/saleOrder/SaleOrderCancelConfirm";
import { SaleOrderCompleteConfirm } from "../../components/organisms/saleOrder/SaleOrderCompleteConfirm";

const SaleOrderDealerPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  // ========================
  // State
  // ========================
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrderResponse | null>(
    null
  );
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<string>("desc");

  // ========================
  // Role
  // ========================
  const role = (user as any)?.role as "MANAGER" | "DEALER_STAFF";

  // ========================
  // Query Params
  // ========================
  const params = useMemo(() => {
    const statuses = statusFilter === "ALL" ? undefined : [statusFilter];
    return { page: 0, size: 10, statuses, sortField, sortDir };
  }, [statusFilter, sortField, sortDir]);

  // ========================
  // Data
  // ========================
  const { data, isLoading, isFetching, refetch } = useSaleOrdersOfCurrentDealer(
    {},
    params
  );
  const orders: SaleOrderResponse[] =
    ((data as any)?.result?.data as SaleOrderResponse[]) ?? [];

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortField, sortDir]);

  // ========================
  // Summary cho bộ filter bar (luôn giữ count gốc)
  // ========================
  const allOrders: SaleOrderResponse[] =
    ((data as any)?.result?.data as SaleOrderResponse[]) ?? [];

  const statusCounts = useMemo(() => {
    const counts = { all: 0, created: 0, completed: 0, canceled: 0 };
    allOrders.forEach((o) => {
      counts.all++;
      if (o.status === "CREATED") counts.created++;
      else if (o.status === "COMPLETED") counts.completed++;
      else if (o.status === "CANCELED") counts.canceled++;
    });
    return counts;
  }, [allOrders]);

  // ========================
  // Mutations
  // ========================
  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();
  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderComplete();

  // ========================
  // Handlers
  // ========================
  const handleViewDetail = (id: string) => {
    const base = `/${String(role || "").toLowerCase()}`;
    navigate(`${base}/sale-orders/${id}`, { replace: false });
  };

  const handleDeleteClick = (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;
    setSelectedOrder(target);
    setConfirmCancelOpen(true);
  };

  const handleCompleteClick = (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;
    setSelectedOrder(target);
    setConfirmCompleteOpen(true);
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

  const handleComplete = async () => {
    if (!selectedOrder) return;
    try {
      await completeOrder(selectedOrder.id);
      message.success("Đã hoàn tất đơn hàng!");
      refetch();
    } catch {
      message.error("Không thể hoàn tất đơn hàng!");
    } finally {
      setConfirmCompleteOpen(false);
    }
  };

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách đơn hàng của đại lý
        </h2>
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
        canDelete
        canComplete
        onDelete={handleDeleteClick}
        onComplete={handleCompleteClick}
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
      <SaleOrderCompleteConfirm
        open={confirmCompleteOpen}
        orderId={selectedOrder?.id}
        onCancel={() => setConfirmCompleteOpen(false)}
        onConfirm={handleComplete}
        loading={completing}
      />
    </CardWrapper>
  );
};

export default SaleOrderDealerPage;
export { SaleOrderDealerPage };
