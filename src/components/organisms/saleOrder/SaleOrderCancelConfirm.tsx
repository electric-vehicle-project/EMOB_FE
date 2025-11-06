import { Modal } from "antd";

interface ConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  orderId?: string;
}

export const SaleOrderCancelConfirm = ({
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
    okText="Hủy đơn hàng"
    cancelText="Đóng"
    okButtonProps={{ danger: true, loading }}
  >
    <p>
      Bạn có chắc chắn muốn hủy đơn hàng <b>{orderId}</b> không?
    </p>
  </Modal>
);
