import { Descriptions, Tag, Spin } from "antd";
import dayjs from "dayjs";
import { useGetAccountById } from "../../../service/accountService";
import type { SaleOrderResponse } from "../../../model/SaleOrder";

interface Props {
  order: SaleOrderResponse;
}

export const SaleOrderDetailInfo = ({ order }: Props) => {
  // ==========================
  // 👤 Lấy thông tin người tạo (accountName)
  // ==========================
  const { data: accountData, isLoading: accountLoading } = useGetAccountById(
    order.accountId ?? "",
    {
      enabled: !!order.accountId,
    }
  );

  const accountName =
    accountData?.result?.fullName ??
    accountData?.result?.username ??
    order.accountId;

  // ==========================
  // 💅 UI Render
  // ==========================
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <Descriptions
        title="Thông tin chi tiết đơn hàng"
        bordered
        column={2}
        labelStyle={{ fontWeight: 600, width: "40%" }}
      >
        <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag
            color={
              order.status === "CREATED"
                ? "blue"
                : order.status === "COMPLETED"
                ? "green"
                : "red"
            }
          >
            {order.status === "CREATED"
              ? "Đã tạo"
              : order.status === "COMPLETED"
              ? "Hoàn tất"
              : "Đã hủy"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {dayjs(order.createdAt).format("HH:mm:ss DD/MM/YYYY")}
        </Descriptions.Item>

        <Descriptions.Item label="Tổng số lượng">
          {order.totalQuantity}
        </Descriptions.Item>

        <Descriptions.Item label="Tổng tiền (VNĐ)">
          {order.totalPrice.toLocaleString("vi-VN")} ₫
        </Descriptions.Item>

        {order.vatAmount && (
          <Descriptions.Item label="VAT">
            {order.vatAmount.toLocaleString("vi-VN")} ₫
          </Descriptions.Item>
        )}

        {order.saleContractId && (
          <Descriptions.Item label="Hợp đồng">
            <Tag color="blue">Đã có hợp đồng #{order.saleContractId}</Tag>
          </Descriptions.Item>
        )}

        {accountLoading ? (
          <Descriptions.Item label="Người tạo">
            <Spin size="small" />
          </Descriptions.Item>
        ) : (
          order.accountId && (
            <Descriptions.Item label="Người tạo">
              {accountName}
            </Descriptions.Item>
          )
        )}

        {order.customerId && (
          <Descriptions.Item label="Mã khách hàng">
            {order.customerId}
          </Descriptions.Item>
        )}

        {order.dealerId && (
          <Descriptions.Item label="Mã đại lý">
            {order.dealerId}
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};
