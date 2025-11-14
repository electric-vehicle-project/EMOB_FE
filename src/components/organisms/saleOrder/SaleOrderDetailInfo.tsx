import React from "react";
import type { SaleOrderResponse } from "../../../model/SaleOrder";

interface Props {
  order: SaleOrderResponse;
  role?: "MANAGER" | "DEALER_STAFF" | "EVM_STAFF" | "ADMIN" | null;
}

// Tạo type phụ có thể chứa các field linh hoạt
type PartialSaleOrder = SaleOrderResponse & {
  totalPrice?: number;
  totalAmount?: number;
  grandTotal?: number;
  customerName?: string;
  customerFullName?: string;
  customerEmail?: string;
  email?: string;
  createdAt?: string;
  customerId?: string;
};

export const SaleOrderDetailInfo: React.FC<Props> = ({ order, role }) => {
  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";
  const isManager = role === "MANAGER";

  const o = order as PartialSaleOrder;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const customerName =
    o.customerName ||
    o.customerFullName ||
    `Khách hàng #${o.customerId ?? "?"}`;

  const customerEmail = o.customerEmail || o.email || "Không có email";

  const total = o.totalPrice || o.totalAmount || o.grandTotal || 0;

  return (
    <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-[15px]">
      {/* ===== Thông tin cơ bản ===== */}
      <p>
        <strong>Mã đơn hàng:</strong> {o.id || "Không có"}
      </p>

      <p>
        <strong>Trạng thái:</strong>{" "}
        {o.status === "CREATED"
          ? "Đã tạo"
          : o.status === "COMPLETED"
          ? "Hoàn tất"
          : o.status === "CANCELED"
          ? "Đã hủy"
          : "Không xác định"}
      </p>

      <p>
        <strong>Ngày tạo:</strong> {formatDate(o.createdAt)}
      </p>

      <p>
        <strong>Tổng tiền:</strong>{" "}
        {total ? total.toLocaleString("vi-VN") + " ₫" : "Chưa có"}
      </p>

      {/* ===== Thông tin khách hàng ===== */}
      <p>
        <strong>Khách hàng:</strong> {customerName}
      </p>

      <p>
        <strong>Email khách hàng:</strong> {customerEmail}
      </p>

      {/* ===== Hiển thị thêm theo vai trò ===== */}
      {isDealerStaff && (
        <p className="col-span-2 text-[#4f6f52]">
          <strong>Vai trò:</strong> Nhân viên đại lý - được phép hoàn tất hoặc
          hủy đơn hàng.
        </p>
      )}

      {isEvmStaff && (
        <p className="col-span-2 text-[#4f6f52]">
          <strong>Vai trò:</strong> Nhân viên EVM - theo dõi và xác nhận các đơn
          hàng của đại lý.
        </p>
      )}

      {isManager && (
        <p className="col-span-2 text-[#4f6f52]">
          <strong>Vai trò:</strong> Quản lý đại lý - có thể xem tất cả đơn hàng
          thuộc quyền quản lý.
        </p>
      )}
    </div>
  );
};
