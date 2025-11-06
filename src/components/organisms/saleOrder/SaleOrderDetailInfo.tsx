// src/components/organisms/saleOrder/SaleOrderDetailInfo.tsx
import { Descriptions, Tag, Spin } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { useCustomerById } from "../../../service/customerService";
import { useDealerByIdQuery } from "../../../service/dealerService";
import type { SaleOrderResponse } from "../../../model/SaleOrder";
import { formatDateVietnam } from "../../../utils/timeFeature";

interface Props {
  order: SaleOrderResponse;
}

export const SaleOrderDetailInfo = ({ order }: Props) => {
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state?.user?.role ?? null);

  // ==============================
  // 🧩 Local state
  // ==============================
  const [customerName, setCustomerName] = useState("Không xác định");
  const [dealerName, setDealerName] = useState("Không xác định");

  // ==============================
  // 🔄 API calls
  // ==============================
  const { data: customerData, isLoading: loadingCustomer } = useCustomerById(
    order.customerId ?? "",
    { enabled: !!order.customerId }
  );

  // ❗️ Chỉ ADMIN hoặc EVM_STAFF mới được gọi API dealer
  const canViewDealer = role === "ADMIN" || role === "EVM_STAFF";
  const { data: dealerData, isLoading: loadingDealer } = useDealerByIdQuery(
    order.dealerId ?? "",
    {
      enabled: canViewDealer && !!order.dealerId,
    }
  );

  // ==============================
  // 🧮 Set tên hiển thị
  // ==============================
  useEffect(() => {
    if (order.customerId && customerData?.result) {
      setCustomerName(customerData.result.fullName ?? "Không xác định");
    }
    if (canViewDealer && order.dealerId && dealerData?.result) {
      setDealerName(dealerData.result.name ?? "Không xác định");
    }
  }, [order, customerData, dealerData, canViewDealer]);

  // ==============================
  // 🏷️ Trạng thái đơn
  // ==============================
  const statusTag = useMemo(() => {
    const color =
      order.status === "CREATED"
        ? "processing"
        : order.status === "COMPLETED"
        ? "success"
        : "error";

    const text =
      order.status === "CREATED"
        ? "Đã tạo"
        : order.status === "COMPLETED"
        ? "Hoàn tất"
        : "Đã hủy";

    return <Tag color={color}>{text}</Tag>;
  }, [order.status]);

  // ==============================
  // 🧾 Danh sách ô hiển thị
  // ==============================
  const baseItems = [
    { key: "id", label: "Mã đơn hàng", children: order.id ?? "-" },
    { key: "status", label: "Trạng thái", children: statusTag },
    {
      key: "createdAt",
      label: "Ngày tạo",
      children: formatDateVietnam(order.createdAt),
    },
    {
      key: "totalQuantity",
      label: "Tổng số lượng",
      children: order.totalQuantity ?? "-",
    },
    {
      key: "totalPrice",
      label: "Tổng tiền (VNĐ)",
      children: order.totalPrice?.toLocaleString("vi-VN") ?? "-",
    },
  ];

  const partnerItem = (() => {
    // --- Trường hợp đơn đại lý ↔ khách hàng ---
    if (order.customerId) {
      return {
        key: "customer",
        label: "Khách hàng",
        children: loadingCustomer ? (
          <Spin size="small" />
        ) : (
          <a
            onClick={() =>
              navigate(`/dealer_staff/customers/${order.customerId}`)
            }
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {customerName}
          </a>
        ),
      };
    }

    // --- Trường hợp đơn EVM ↔ đại lý ---
    if (!order.customerId && canViewDealer && order.dealerId) {
      return {
        key: "dealer",
        label: "Đại lý",
        children: loadingDealer ? (
          <Spin size="small" />
        ) : (
          <span className="font-medium text-gray-800">{dealerName}</span>
        ),
      };
    }

    // --- Trường hợp role không có quyền xem đại lý ---
    return null;
  })();

  const contractItem = {
    key: "contract",
    label: "Hợp đồng",
    children: order.saleContractId ? (
      <Tag color="blue">{order.saleContractId}</Tag>
    ) : (
      "-"
    ),
  };

  // Gộp tất cả, loại bỏ null
  const items = [...baseItems, partnerItem, contractItem].filter(Boolean);

  // ==============================
  // 🖥️ Render
  // ==============================
  return (
    <Descriptions
      title="Thông tin chi tiết đơn hàng"
      bordered
      column={2}
      items={items}
      className="bg-white rounded-xl p-4"
    />
  );
};
