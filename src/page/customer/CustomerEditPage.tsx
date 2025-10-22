import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import {
  useCustomerById,
  useCustomerUpdate,
} from "../../service/customerService";
import { ROUTES } from "../../model/routePaths";
import type { ICustomer } from "../../model/Customer";

const { TextArea } = Input;

// Kiểu dữ liệu cho form (bỏ id vì không cần chỉnh)
type CustomerFormValues = Omit<ICustomer, "id">;

export const CustomerEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // ===== Gọi API lấy chi tiết khách hàng =====
  const { data, isLoading } = useCustomerById(id ?? "");
  const { mutateAsync: updateCustomer } = useCustomerUpdate();

  const customer: ICustomer | undefined = data?.result;

  // ===== Prefill dữ liệu vào form =====
  useEffect(() => {
    if (customer) {
      form.setFieldsValue({
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        note: customer.note,
        dateOfBirth: customer.dateOfBirth
          ? dayjs(customer.dateOfBirth, "YYYY-MM-DD")
          : undefined,
        gender: customer.gender,
        loyaltyPoints: customer.loyaltyPoints,
      });
    }
  }, [customer, form]);

  // ===== Xử lý submit form =====
  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : undefined,
      };

      if (!id) {
        message.error("Không tìm thấy ID khách hàng");
        return;
      }

      await updateCustomer({ id: id!, data: payload });
      message.success("Cập nhật khách hàng thành công");
      navigate(`${ROUTES.DEALER_STAFF}/customers`);
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Không thể cập nhật khách hàng, vui lòng thử lại.");
    }
  };

  // ===== Loading =====
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  // ===== UI =====
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold mb-4">Chỉnh sửa khách hàng</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="max-w-3xl"
      >
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^(0\d{9}|\+84\d{9})$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          name="dateOfBirth"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
        >
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        >
          <Select
            options={[
              { label: "MALE", value: "MALE" },
              { label: "FEMALE", value: "FEMALE" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Điểm tích luỹ"
          name="loyaltyPoints"
          rules={[
            { required: true, message: "Vui lòng nhập điểm tích luỹ" },
            {
              type: "number",
              min: 0,
              message: "Điểm tích luỹ không được nhỏ hơn 0",
            },
          ]}
        >
          <InputNumber className="w-full" min={0} />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <TextArea
            rows={3}
            allowClear
            style={{ resize: "none", borderRadius: 8 }}
          />
        </Form.Item>

        <div className="flex gap-3 mt-6">
          <Button
            type="primary"
            htmlType="submit"
            className="px-6"
            style={{ backgroundColor: "#627254", border: "none" }}
          >
            Lưu thay đổi
          </Button>

          <Button onClick={() => navigate(`${ROUTES.DEALER_STAFF}/customers`)}>
            Huỷ
          </Button>
        </div>
      </Form>
    </div>
  );
};
