import { Modal, Form, DatePicker, Select, Input } from "antd";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onCancel: () => void;
  onCreated: () => void;
}

export const TestDriveCreationModal = ({ open, onCancel, onCreated }: Props) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(() => {
      // TODO: Gọi API POST /api/test-drive/schedules
      onCreated();
    });
  };

  return (
    <Modal
      title="Tạo lịch lái thử"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Khách hàng" name="customerId" rules={[{ required: true }]}>
          <Select placeholder="Chọn khách hàng" />
        </Form.Item>
        <Form.Item label="Thời gian bắt đầu" name="scheduledAt" rules={[{ required: true }]}>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            defaultValue={dayjs().hour(8).minute(0)}
          />
        </Form.Item>
        <Form.Item label="Thời lượng (phút)" name="duration" initialValue={120}>
          <Select
            options={[
              { label: "60 phút", value: 60 },
              { label: "90 phút", value: 90 },
              { label: "120 phút", value: 120 },
            ]}
          />
        </Form.Item>
        <Form.Item label="Địa điểm" name="location" initialValue="Tại đại lý">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
