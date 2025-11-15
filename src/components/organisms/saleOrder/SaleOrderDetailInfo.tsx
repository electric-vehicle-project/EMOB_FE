import { Tag } from "antd";
import type { SaleOrderResponse, OrderStatus } from "../../../model/SaleOrder";

interface CustomerLite {
  id?: string;
  fullName?: string;
  email?: string;
}

interface DealerLite {
  id?: string;
  name?: string;
  email?: string;
}

interface Props {
  order: SaleOrderResponse;
  customer?: CustomerLite | null;
  dealer?: DealerLite | null;
}

export const SaleOrderDetailInfo: React.FC<Props> = ({
  order,
  customer,
  dealer,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const hasDealer = !!order.dealerId;

  const customerNameLabel = hasDealer ? "Đại lý" : "Khách hàng";
  const customerEmailLabel = hasDealer ? "Email đại lý" : "Email khách hàng";

  const displayName = hasDealer
    ? dealer?.name || `Đại lý #${order.dealerId ?? "?"}`
    : customer?.fullName || `Khách hàng #${order.customerId ?? "?"}`;

  const displayEmail = hasDealer
    ? dealer?.email || "Không có email"
    : customer?.email || "Không có email";

  const total = order.totalPrice ?? 0;

  const statusColor: Record<OrderStatus, "processing" | "success" | "error"> = {
    CREATED: "processing",
    COMPLETED: "success",
    CANCELED: "error",
  };

  const statusText =
    order.status === "CREATED"
      ? "Đã tạo"
      : order.status === "COMPLETED"
      ? "Hoàn tất"
      : "Đã hủy";

  return (
    <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-[15px]">
      <p>
        <strong>Mã đơn hàng:</strong> {order.id || "Không có"}
      </p>

      <p>
        <strong>Trạng thái:</strong>{" "}
        <Tag color={statusColor[order.status]} className="ml-1">
          {statusText}
        </Tag>
      </p>

      <p>
        <strong>Ngày tạo:</strong> {formatDate(order.createdAt)}
      </p>

      <p>
        <strong>Tổng tiền:</strong>{" "}
        {total ? `${total.toLocaleString("vi-VN")} ₫` : "Chưa có"}
      </p>

      <p>
        <strong>{customerNameLabel}:</strong> {displayName}
      </p>

      <p>
        <strong>{customerEmailLabel}:</strong> {displayEmail}
      </p>
    </div>
  );
};
