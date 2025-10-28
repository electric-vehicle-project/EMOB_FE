import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Table,
  Button,
  Popconfirm,
  message,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import {
  useSaleOrderById,
  useSaleOrderComplete,
  useSaleOrderDelete,
} from "../../service/saleOrderService";
import { useGetVehicles } from "../../service/vehicleService";
import { SaleOrderStatusTag } from "../../components/molecules/SaleOrderStatusTag";
import type { ISaleOrder, ISaleOrderItem } from "../../model/SaleOrder";

export const SaleOrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // ===== Sale Order Hooks =====
  const { data, isLoading, refetch } = useSaleOrderById(orderId);
  const order: ISaleOrder | undefined = data?.result;
  const { mutateAsync: completeOrder } = useSaleOrderComplete();
  const { mutateAsync: cancelOrder } = useSaleOrderDelete();

  // ===== Vehicle List =====
  const { data: vehiclesData, isLoading: isVehicleLoading } = useGetVehicles();
  const vehicles =
    vehiclesData?.result?.data ?? vehiclesData?.result ?? vehiclesData ?? [];
  const vehicleMap = new Map(
    vehicles.map((v: { id: string; model: string }) => [v.id, v.model])
  );

  // ===== Loading & Not Found =====
  if (isLoading || isVehicleLoading)
    return (
      <div className="flex justify-center mt-10">
        <Spin size="large" />
      </div>
    );

  if (!order)
    return (
      <div className="p-6 text-center text-gray-500">
        Không tìm thấy đơn hàng
      </div>
    );

  // ===== Handlers =====
  const handleComplete = async () => {
    try {
      await completeOrder({ request: { orderId } });
      message.success("Hoàn tất đơn hàng thành công");
      refetch();
    } catch {
      message.error("Không thể hoàn tất đơn hàng");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId!);
      message.success("Đã huỷ đơn hàng");
      refetch();
    } catch {
      message.error("Huỷ đơn hàng thất bại");
    }
  };

  // ===== Table Columns =====
  const columns: ColumnsType<ISaleOrderItem> = [
    {
      title: "Mẫu xe",
      dataIndex: "vehicleId",
      key: "vehicleId",
      render: (id: string) => {
        const name = vehicleMap.get(id);
        return (
          <span className="font-medium text-gray-700">
            {typeof name === "string" ? name : "Không xác định"}
          </span>
        );
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      align: "center" as const,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "Giá đơn vị (₫)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (v: number) => v?.toLocaleString(),
      align: "right" as const,
    },
    {
      title: "Chiết khấu (₫)",
      dataIndex: "discountPrice",
      key: "discountPrice",
      render: (v: number) => v?.toLocaleString(),
      align: "right" as const,
    },
    {
      title: "Thành tiền (₫)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v: number) => v?.toLocaleString(),
      align: "right" as const,
    },
  ];

  // ===== Render =====
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-[#627254]">Chi tiết đơn hàng</h1>
        <Button onClick={() => navigate(-1)}>← Quay lại</Button>
      </div>

      {/* Order Info */}
      <Card bordered className="mb-6">
        <Descriptions title="Thông tin đơn hàng" bordered column={2}>
          <Descriptions.Item label="Mã đơn hàng">
            {order.id.slice(0, 8).toUpperCase()}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>

          <Descriptions.Item label="Tổng tiền">
            {order.totalPrice.toLocaleString()} ₫
          </Descriptions.Item>

          <Descriptions.Item label="Tổng SL">
            {order.totalQuantity}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <SaleOrderStatusTag status={order.status} />
          </Descriptions.Item>

          <Descriptions.Item label="Thanh toán">
            <Tag color="cyan">{order.paymentStatus ?? "—"}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Order Items */}
      <Card title="Danh sách sản phẩm" bordered>
        <Table<ISaleOrderItem>
          rowKey="id"
          dataSource={order.items}
          columns={columns}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Actions */}
      {order.status === "CREATED" && (
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="primary"
            className="!bg-[#627254] border-none"
            onClick={handleComplete}
          >
            Hoàn tất
          </Button>

          <Popconfirm title="Xác nhận huỷ đơn hàng?" onConfirm={handleCancel}>
            <Button danger>Huỷ</Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
};
