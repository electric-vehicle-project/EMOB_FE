import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useCustomerCreate } from "../../service/customerService";
import type { ICustomer } from "../../model/Customer";

// Định nghĩa type form (loại bỏ id)
type CustomerFormValues = Omit<ICustomer, "id">;

export const CustomerCreatePage = () => {
  const [form] = Form.useForm<CustomerFormValues>();
  const navigate = useNavigate();
  const { mutateAsync: createCustomer } = useCustomerCreate();

  // ===== Xử lý submit =====
  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : undefined,
      };

      await createCustomer(payload);
      message.success("Thêm khách hàng thành công!");
      form.resetFields(); // reset form sau khi tạo
      navigate("/dealer-staff/customers");
    } catch (error) {
      console.error("Create failed:", error);
      message.error("Không thể tạo khách hàng, vui lòng thử lại.");
    }
  };

  // ===== Giao diện =====
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Tạo khách hàng mới</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="max-w-3xl"
      >
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nguyễn Văn A" allowClear />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="example@gmail.com" allowClear />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^(0\d{9}|\+84\d{9})$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input placeholder="0909xxxxxx" allowClear />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input placeholder="123 Đường A, Quận B" allowClear />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea
            rows={3}
            allowClear
            style={{ resize: "none", borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
        >
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        >
          <Select
            options={[
              { label: "Nam", value: "MALE" },
              { label: "Nữ", value: "FEMALE" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="loyaltyPoints"
          label="Điểm tích lũy ban đầu"
          rules={[
            { type: "number", min: 0, message: "Điểm tích lũy không hợp lệ" },
          ]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <div className="flex gap-3 mt-6">
          <Button
            type="primary"
            htmlType="submit"
            className="px-6"
            style={{ backgroundColor: "#627254", border: "none" }}
          >
            Tạo khách hàng
          </Button>

          <Button onClick={() => navigate("/dealer-staff/customers")}>
            Hủy
          </Button>
        </div>
      </Form>
    </div>
  );
};
