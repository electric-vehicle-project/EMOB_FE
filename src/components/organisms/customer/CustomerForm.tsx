// src/components/organisms/customer/CustomerForm.tsx
import { Form, Input, InputNumber, DatePicker, Select, Button } from "antd";
import type { FormInstance } from "antd/es/form";
import dayjs from "dayjs";
import type { ICustomer } from "../../../model/Customer";
import { useEffect } from "react";

export interface CustomerFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth?: string | dayjs.Dayjs;
  gender?: "MALE" | "FEMALE";
  loyaltyPoints?: number;
  note?: string;
}

interface Props {
  form: FormInstance<CustomerFormData>;
  initialValues?: Partial<
    Omit<ICustomer, "dateOfBirth"> & { dateOfBirth?: dayjs.Dayjs }
  >;
  onSubmit: (data: CustomerFormData) => void;
  loading?: boolean;
}

export const CustomerForm = ({
  form,
  initialValues,
  onSubmit,
  loading,
}: Props) => {
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleFinish = (values: CustomerFormData) => {
    const payload: CustomerFormData = {
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
      disabled={loading}
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      >
        <Input placeholder="Nguyễn Văn A" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input placeholder="example@gmail.com" />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label="Số điện thoại"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            pattern: /^0\d{9}$/,
            message: "Số điện thoại không hợp lệ",
          },
        ]}
      >
        <Input placeholder="0123456789" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
      >
        <Input placeholder="123 Đường A, Quận B, TP. HCM" />
      </Form.Item>

      <Form.Item
        name="dateOfBirth"
        label="Ngày sinh"
        rules={[
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const age = dayjs().diff(dayjs(value), "year");
              if (age < 18) return Promise.reject("Khách hàng phải từ 18 tuổi");
              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker className="w-full" format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item name="gender" label="Giới tính">
        <Select
          placeholder="Chọn giới tính"
          options={[
            { label: "Nam", value: "MALE" },
            { label: "Nữ", value: "FEMALE" },
          ]}
        />
      </Form.Item>

      <Form.Item name="loyaltyPoints" label="Điểm tích luỹ">
        <InputNumber className="w-full" min={0} />
      </Form.Item>

      <Form.Item
        name="note"
        label="Ghi chú"
        rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}
      >
        <Input.TextArea
          rows={3}
          style={{
            borderRadius: 8,
            resize: "none",
          }}
        />
      </Form.Item>

      <div className="flex justify-end">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ borderRadius: 8 }}
        >
          Lưu thông tin
        </Button>
      </div>
    </Form>
  );
};
