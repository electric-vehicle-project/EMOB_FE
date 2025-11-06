import { Button, Popconfirm } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

interface Props {
  orderId: string;
  onView: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export const SaleOrderActionButtons = ({
  orderId,
  onView,
  onComplete,
  onCancel,
}: Props) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button icon={<EyeOutlined />} onClick={() => onView(orderId)}>
        Chi tiết
      </Button>
      <Button
        icon={<CheckCircleOutlined />}
        type="primary"
        onClick={() => onComplete(orderId)}
        className="!bg-[#627254] border-none"
      >
        Hoàn tất
      </Button>
      <Popconfirm title="Xác nhận huỷ đơn?" onConfirm={() => onCancel(orderId)}>
        <Button danger icon={<StopOutlined />}>
          Huỷ
        </Button>
      </Popconfirm>
    </div>
  );
};
