import { Modal } from "antd";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirm = ({ open, onConfirm, onCancel }: Props) => (
  <Modal
    open={open}
    onOk={onConfirm}
    onCancel={onCancel}
    okText="Xóa"
    okButtonProps={{ danger: true }}
  >
    Bạn có chắc chắn muốn xóa dealer này?
  </Modal>
);
