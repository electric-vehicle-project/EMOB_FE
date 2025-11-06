import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Divider, message, Spin, Tag } from "antd";
import {
  useSaleOrderById,
  useSaleOrderComplete,
  useSaleOrderDelete,
} from "../../service/saleOrderService";
import { SaleOrderDetailInfo } from "../../components/organisms/saleOrder/SaleOrderDetailInfo";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { SaleOrderItemTable } from "../../components/organisms/saleOrder/SaleOrderItemTable";

export const SaleOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => {
    return state?.user?.role ?? null;
  });

  // ==============================
  // 🔍 Gọi API lấy chi tiết đơn hàng
  // ==============================
  const { data: orderData, isLoading, refetch } = useSaleOrderById(id ?? "");

  const { mutate: completeOrder, isPending: completing } =
    useSaleOrderComplete();
  const { mutate: cancelOrder, isPending: canceling } = useSaleOrderDelete();

  const order = orderData?.result ?? orderData?.data ?? null;

  // ==============================
  // 🧩 Hành động
  // ==============================
  const handleComplete = () => {
    if (!id) return;
    completeOrder(id, {
      onSuccess: () => {
        message.success("Hoàn tất đơn hàng thành công");
        refetch();
      },
      onError: () => message.error("Không thể hoàn tất đơn hàng"),
    });
  };

  const handleCancel = () => {
    if (!id) return;
    cancelOrder(id, {
      onSuccess: () => {
        message.success("Đã hủy đơn hàng");
        refetch();
      },
      onError: () => message.error("Không thể hủy đơn hàng"),
    });
  };

  // ==============================
  // ⏳ Loading state
  // ==============================
  if (isLoading || !order) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  // ==============================
  // 👥 Phân quyền
  // ==============================
  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";
  const isManager = role === "MANAGER";

  // ==============================
  // 🏷️ Màu trạng thái
  // ==============================
  const statusColor: Record<string, string> = {
    CREATED: "processing",
    COMPLETED: "success",
    CANCELED: "error",
  };

  // ==============================
  // 🎨 Render UI
  // ==============================
  return (
    <div className="p-6 space-y-6">
      <Card
        bordered={false}
        className="shadow-md rounded-2xl"
        title={
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="flex items-center bg-[#3f4a3c] text-white hover:!bg-[#2f382e]"
            >
              Quay lại
            </Button>
            <span className="text-lg font-semibold text-[#3f4a3c]">
              Chi tiết đơn hàng #{order.id?.slice(0, 8)}
            </span>
            <Tag color={statusColor[order.status]} className="ml-2 text-sm">
              {order.status === "CREATED"
                ? "Đã tạo"
                : order.status === "COMPLETED"
                ? "Hoàn tất"
                : "Đã hủy"}
            </Tag>
          </div>
        }
      >
        {/* ===== Thông tin đơn hàng ===== */}
        <SaleOrderDetailInfo order={order} />

        <Divider />

        {/* ===== Danh sách sản phẩm ===== */}
        <h3 className="text-lg font-medium mb-2 text-[#3f4a3c]">
          Danh sách sản phẩm
        </h3>
        <SaleOrderItemTable items={order.items || []} />

        {/* ===== Action buttons ===== */}
        <Divider />
        {(isDealerStaff || isEvmStaff) && order.status === "CREATED" && (
          <div className="flex justify-end gap-3 mt-4">
            <Button
              danger
              loading={canceling}
              onClick={handleCancel}
              className="px-5 rounded-lg"
            >
              Hủy đơn hàng
            </Button>
            <Button
              type="primary"
              loading={completing}
              onClick={handleComplete}
              className="bg-[#3f4a3c] border-none hover:!bg-[#2f382e] px-6 rounded-lg"
            >
              Hoàn tất đơn hàng
            </Button>
          </div>
        )}

        {/* Manager chỉ xem */}
        {isManager && (
          <div className="flex justify-end mt-3">
            <Tag color="default">Quản lý chỉ có quyền xem</Tag>
          </div>
        )}
      </Card>
    </div>
  );
};
