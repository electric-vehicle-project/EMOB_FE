// src/components/molecules/test-drive/TestDriveCreateModal.tsx
import { Modal, Form, Select, DatePicker, InputNumber, Input, message } from "antd";
import dayjs from "dayjs";
import { useCreateTestDriveMutation } from "../../../service/testDriveService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TestDriveCreateModal = ({ open, onClose, onSuccess }: Props) => {
  const [form] = Form.useForm();
  const { mutateAsync: createTestDrive, isPending } = useCreateTestDriveMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createTestDrive({
        customerId: values.customerId,
        testDriveVehicleId: values.vehicleId,
        location: values.location,
        duration: values.duration,
        scheduledAt: values.scheduledAt.format("YYYY-MM-DDTHH:mm:ss"),
      });
      message.success("Tạo lịch lái thử thành công!");
      form.resetFields();
      onSuccess();
    } catch {
      message.error("Không thể tạo lịch lái thử!");
    }
  };

  return (
    <Modal
      title="Tạo lịch lái thử mới"
      open={open}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Hủy"
      onOk={handleSubmit}
      confirmLoading={isPending}
      centered
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Khách hàng"
          name="customerId"
          rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
        >
          <Select placeholder="Chọn khách hàng" />
        </Form.Item>

        <Form.Item
          label="Xe lái thử"
          name="vehicleId"
          rules={[{ required: true, message: "Vui lòng chọn xe lái thử" }]}
        >
          <Select placeholder="Chọn xe lái thử" />
        </Form.Item>

        <Form.Item
          label="Địa điểm"
          name="location"
          rules={[{ required: true, message: "Nhập địa điểm lái thử" }]}
        >
          <Input placeholder="EV Showroom District 9" />
        </Form.Item>

        <Form.Item
          label="Thời lượng (phút)"
          name="duration"
          initialValue={60}
          rules={[{ required: true, message: "Nhập thời lượng lái thử" }]}
        >
          <InputNumber min={30} max={180} step={15} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Thời gian bắt đầu"
          name="scheduledAt"
          rules={[{ required: true, message: "Chọn thời gian bắt đầu" }]}
        >
          <DatePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            disabledDate={(d) => d.isBefore(dayjs(), "day")}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
