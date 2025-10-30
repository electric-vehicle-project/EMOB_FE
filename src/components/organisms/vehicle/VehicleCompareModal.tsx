// src/components/organisms/vehicle/VehicleCompareModal.tsx
import { Modal, Select, Typography, Space } from "antd";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const VehicleCompareModal = ({ open, onClose }: Props) => {
  const [rightId, setRightId] = useState<string | undefined>();
  useEffect(() => {
    if (!open) setRightId(undefined);
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      okText="Bắt đầu so sánh"
      title="So sánh mẫu xe"
      width={900}
      destroyOnClose
      onOk={() => {}}
    >
      <Space direction="vertical" className="w-full">
        <div>
          <Typography.Text>
            Chọn mẫu xe để so sánh với mẫu hiện tại:
          </Typography.Text>
          <Select
            className="w-full mt-2"
            placeholder="Chọn mẫu xe"
            value={rightId}
            onChange={setRightId}
            showSearch
            options={[]}
            disabled
          />
        </div>
        <div style={{ minHeight: 120, textAlign: "center", paddingTop: 30 }}>
          So sánh xe sẽ hiển thị ở đây.
        </div>
      </Space>
    </Modal>
  );
};
