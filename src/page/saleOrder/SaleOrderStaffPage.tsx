import { useEffect, useMemo, useState } from "react";
import { Button, message } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ArrowLeftOutlined } from "@ant-design/icons";

import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrderListStaffCurrent, // ✅ đổi đúng hook thật
  useSaleOrderDelete,
  useSaleOrderComplete,
} from "../../service/saleOrderService";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderFilterBar } from "../../components/organisms/saleOrder/SaleOrderFilterBar";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { SaleOrderCancelConfirm } from "../../components/organisms/saleOrder/SaleOrderCancelConfirm";
import { SaleOrderCompleteConfirm } from "../../components/organisms/saleOrder/SaleOrderCompleteConfirm";

const SaleOrderStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const role = user?.role ?? "DEALER_STAFF";

  // Bộ lọc và sắp xếp
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Popup xác nhận
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrderResponse | null>(
    null
  );

  // Tham số truy vấn
  const params = useMemo(() => {
    const statuses = statusFilter === "ALL" ? undefined : [statusFilter];
    return { page: 0, size: 10, statuses, sortField, sortDir };
  }, [statusFilter, sortField, sortDir]);

  // Lấy danh sách đơn hàng của nhân viên hiện tại
  const { data, isLoading, isFetching, refetch } =
    useSaleOrderListStaffCurrent(params);
  const orders: SaleOrderResponse[] = data?.result?.data ?? data?.data ?? [];

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortField, sortDir]);

  // Thống kê trạng thái
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

  // API hành động
  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();
  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderComplete();

  // Xử lý hành động
  const handleViewDetail = (id: string) => {
    navigate(`/${role.toLowerCase()}/sale-order/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setSelectedOrder(order);
    setConfirmCancelOpen(true);
  };

  const handleCompleteClick = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setSelectedOrder(order);
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
      message.error("Không thể hoàn tất đơn hàng này!");
    } finally {
      setConfirmCompleteOpen(false);
    }
  };

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Đơn hàng của nhân viên
        </h2>
        <Button
          onClick={() => navigate("/dealer_staff/sale-order")}
          type="primary"
          icon={<ArrowLeftOutlined />}
        >
          Quay lại đơn hàng của đại lý
        </Button>
      </div>

      <SaleOrderFilterBar
        counts={statusCounts}
        defaultStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <SaleOrderTable
        key={`orders-${statusFilter}-${sortField}-${sortDir}`}
        data={orders}
        loading={isLoading || isFetching || canceling || completing}
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

export default SaleOrderStaffPage;
export { SaleOrderStaffPage };
