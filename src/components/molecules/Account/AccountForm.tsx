import { Form, Input, Select, DatePicker, Button } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Gender, Role } from "../../../model/Account";

interface AccountFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender;
  role: Role;
  dateOfBirth: Dayjs;
  password: string;
}

export type AccountCreatePayload = Omit<AccountFormValues, "dateOfBirth"> & {
  dateOfBirth: string;
};

interface Props {
  onSubmit: (values: AccountCreatePayload) => void;
  loading?: boolean;
  role: Role; // role hiện tại (ADMIN hoặc MANAGER)
}

export const AccountForm: React.FC<Props> = ({ onSubmit, loading, role }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: AccountFormValues) => {
    const payload: AccountCreatePayload = {
      ...values,
      dateOfBirth: dayjs(values.dateOfBirth).format("YYYY-MM-DD"),
    };
    onSubmit(payload);
    form.resetFields();
  };

  const genderOptions = [
    { label: "Nam", value: Gender.MALE },
    { label: "Nữ", value: Gender.FEMALE },
    { label: "Khác", value: Gender.UNKNOWN },
  ];

  // ADMIN có thể tạo MANAGER hoặc EVM_STAFF
  // MANAGER chỉ được tạo DEALER_STAFF
  const roleOptions: Array<{ label: string; value: Role }> =
    role === Role.ADMIN
      ? [
          { label: "Quản lý đại lý", value: Role.MANAGER },
          { label: "Nhân viên EVM", value: Role.EVM_STAFF },
        ]
      : [{ label: "Nhân viên đại lý", value: Role.DEALER_STAFF }];

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      autoComplete="off" // ✅ Ngăn trình duyệt autofill
      requiredMark="optional"
      className="space-y-2"
    >
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      >
        <Input placeholder="Nhập họ và tên" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input placeholder="Nhập email" autoComplete="new-email" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
      >
        <Input placeholder="Nhập số điện thoại" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
      >
        <Input placeholder="Nhập địa chỉ" />
      </Form.Item>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        >
          <Select placeholder="Chọn giới tính" options={genderOptions} />
        </Form.Item>

        <Form.Item
          name="role"
          label="Vai trò"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select placeholder="Chọn vai trò" options={roleOptions} />
        </Form.Item>
      </div>

      <Form.Item
        name="dateOfBirth"
        label="Ngày sinh"
        rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
      >
        <DatePicker
          className="w-full"
          format="DD/MM/YYYY"
          placeholder="Chọn ngày sinh"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
      >
        <Input.Password
          placeholder="Nhập mật khẩu"
          autoComplete="new-password"
        />
      </Form.Item>

      <div className="flex justify-center mt-5">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="bg-evm-green hover:!bg-[#4f6f52] px-6 py-2 rounded-md w-full sm:w-auto transition-all duration-150"
        >
          Tạo tài khoản
        </Button>
      </div>
    </Form>
  );
};
