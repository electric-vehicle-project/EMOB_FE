import { Form, Input, InputNumber, DatePicker, Select, Button } from "antd";
import dayjs from "dayjs";
import type { ICustomer } from "../../../model/Customer";

interface Props {
  mode: "create" | "edit";
  initialValues?: Partial<ICustomer>;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const CustomerForm = ({
  mode,
  initialValues,
  onSubmit,
  loading,
}: Props) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      dateOfBirth: values.dateOfBirth
        ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
        : undefined,
    };
    onSubmit(payload);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      initialValues={initialValues}
      disabled={loading}
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
        <Input placeholder="Nguyễn Văn A" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: "email" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="phoneNumber" label="SĐT" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="dateOfBirth" label="Ngày sinh">
        <DatePicker className="w-full" format="YYYY-MM-DD" />
      </Form.Item>
      <Form.Item name="gender" label="Giới tính">
        <Select
          options={[
            { label: "Nam", value: "MALE" },
            { label: "Nữ", value: "FEMALE" },
          ]}
        />
      </Form.Item>
      <Form.Item name="loyaltyPoints" label="Điểm tích luỹ">
        <InputNumber className="w-full" min={0} />
      </Form.Item>
      <Form.Item name="note" label="Ghi chú">
        <Input.TextArea rows={3} />
      </Form.Item>
      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading}>
          {mode === "create" ? "Tạo khách hàng" : "Cập nhật"}
        </Button>
      </div>
    </Form>
  );
};
