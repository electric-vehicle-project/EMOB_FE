import { Modal } from "antd";

interface ConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  orderId?: string;
}

export const SaleOrderCompleteConfirm = ({
  open,
  onConfirm,
  onCancel,
  loading,
  orderId,
}: ConfirmProps) => (
  <Modal
    open={open}
    onOk={onConfirm}
    onCancel={onCancel}
    okText="Xác nhận hoàn tất"
    cancelText="Đóng"
    okButtonProps={{ type: "primary", loading }}
  >
    <p>
      Xác nhận hoàn tất đơn hàng <b>{orderId}</b>? Sau khi hoàn tất, hợp đồng sẽ
      được tạo tự động.
    </p>
  </Modal>
);
