import { Modal } from "antd";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

export const DeleteConfirm = ({ open, onConfirm, onCancel, message }: Props) => (
  <Modal
    open={open}
    onOk={onConfirm}
    onCancel={onCancel}
    okText="Xóa"
    cancelText="Hủy"
    okButtonProps={{ danger: true }}
  >
    {message}
  </Modal>
);
