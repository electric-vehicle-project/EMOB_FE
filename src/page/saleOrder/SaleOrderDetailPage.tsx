import { useNavigate, useParams } from "react-router";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  message,
  Spin,
  Table,
  Tag,
} from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { SaleOrderResponse } from "../../model/SaleOrder";
import {
  useSaleOrderById,
  useSaleOrderComplete,
  useSaleOrderDelete,
} from "../../service/saleOrderService";
import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderStatusTag } from "../../components/organisms/saleOrder/SaleOrderStatusTag";

export const SaleOrderDetailPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  // =========================
  // API
  // =========================
  const { data, isLoading, refetch } = useSaleOrderById(orderId!);
  const { mutateAsync: completeOrder, isPending: isCompleting } =
    useSaleOrderComplete();
  const { mutateAsync: cancelOrder, isPending: isCanceling } =
    useSaleOrderDelete();

  const order: SaleOrderResponse | null = (data as any)?.result ?? null;

  // =========================
  // Handlers
  // =========================
  const handleBack = () => navigate(-1);

  const handleComplete = async () => {
    if (!orderId) return;
    try {
      await completeOrder(orderId);
      message.success("Đơn hàng đã được hoàn tất!");
      refetch();
    } catch {
      message.error("Không thể hoàn tất đơn hàng!");
    }
  };

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      await cancelOrder(orderId);
      message.success("Đơn hàng đã bị hủy!");
      refetch();
    } catch {
      message.error("Không thể hủy đơn hàng!");
    }
  };

  // =========================
  // Columns
  // =========================
  const columns = [
    {
      title: "Tên xe",
      dataIndex: "vehicleName",
      key: "vehicleName",
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => `${price.toLocaleString()} ₫`,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `${price.toLocaleString()} ₫`,
    },
  ];

  // =========================
  // Render
  // =========================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <CardWrapper>
        <div className="text-center text-gray-500">
          Không tìm thấy đơn hàng.
        </div>
      </CardWrapper>
    );
  }

  const role = (user as any)?.role as
    | "MANAGER"
    | "DEALER_STAFF"
    | "EVM_STAFF"
    | "ADMIN";

  const canComplete =
    order.status === "CREATED" &&
    (role === "DEALER_STAFF" || role === "MANAGER");

  const canCancel =
    order.status === "CREATED" &&
    (role === "DEALER_STAFF" || role === "EVM_STAFF");

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>

        <div className="flex gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Tải lại
          </Button>

          {canCancel && (
            <Button danger loading={isCanceling} onClick={handleCancel}>
              Hủy đơn hàng
            </Button>
          )}

          {canComplete && (
            <Button
              type="primary"
              loading={isCompleting}
              onClick={handleComplete}
              className="!bg-[#4f6f52] border-none"
            >
              Hoàn tất
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <Card bordered>
        <Descriptions
          title="Thông tin đơn hàng"
          column={2}
          bordered
          size="middle"
          labelStyle={{ width: 200, fontWeight: 600 }}
        >
          <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số lượng">
            {order.totalQuantity}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng giá trị">
            {order.totalPrice.toLocaleString()} ₫
          </Descriptions.Item>
          <Descriptions.Item label="VAT">
            {order.vatAmount.toLocaleString()} ₫
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <SaleOrderStatusTag status={order.status} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      {/* Items */}
      <h3 className="text-lg font-semibold mb-2">Danh sách sản phẩm</h3>
      <Table
        dataSource={order.items ?? []}
        columns={columns}
        pagination={false}
        rowKey="id"
      />

      {order.contractId && (
        <>
          <Divider />
          <Tag color="blue">Đã có hợp đồng #{order.contractId}</Tag>
        </>
      )}
    </CardWrapper>
  );
};

export default SaleOrderDetailPage;
