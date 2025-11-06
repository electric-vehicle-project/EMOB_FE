import { Modal, Typography } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { Text } = Typography;

interface Props {
  open: boolean;
  customerName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CustomerDeleteConfirm = ({
  open,
  customerName,
  onConfirm,
  onCancel,
  loading,
}: Props) => (
  <Modal
    open={open}
    title={
      <span className="text-red-600 font-semibold">
        <ExclamationCircleFilled className="mr-2" />
        Xác nhận xoá khách hàng
      </span>
    }
    onOk={onConfirm}
    onCancel={onCancel}
    okText="Xoá"
    cancelText="Huỷ"
    okButtonProps={{ danger: true, loading }}
    destroyOnClose
  >
    <Text>
      Bạn có chắc muốn xoá khách hàng <Text strong>{customerName}</Text> không?
      Hành động này không thể hoàn tác.
    </Text>
  </Modal>
);
