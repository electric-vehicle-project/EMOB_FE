import { Modal, Typography } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { Text } = Typography;

interface Props {
  open: boolean;
  promotionName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Modal xác nhận xoá promotion.
 * Dùng trong PromotionTable hoặc bất kỳ bảng quản lý nào khác.
 */
export const PromotionDeleteConfirm = ({
  open,
  promotionName,
  onConfirm,
  onCancel,
  loading,
}: Props) => {
  return (
    <Modal
      open={open}
      title={
        <span className="text-red-600 font-semibold">
          <ExclamationCircleFilled className="mr-2" />
          Xác nhận xoá khuyến mãi
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
        Bạn có chắc muốn xoá chương trình <Text strong>{promotionName}</Text>{" "}
        không? Hành động này không thể hoàn tác.
      </Text>
    </Modal>
  );
};
