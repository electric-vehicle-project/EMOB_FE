// src/components/molecules/Account/AccountForm.tsx
import { Form, Input, Select, DatePicker, Button } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Gender, Role } from "../../../model/Account";
import type { FormInstance } from "antd/es/form";

/* Helpers */
const trimEdges = (s: string) => (s ?? "").replace(/^\s+|\s+$/g, "");
const toEmail = (s: string) => trimEdges(s).toLowerCase();
const stripPhone = (s: string) => (s ?? "").replace(/[^\d+]/g, "");
const toLocalPhone = (s: string) => {
  const raw = stripPhone(s);
  if (raw.startsWith("+84")) return `0${raw.slice(3)}`;
  return raw;
};
const vnMobile = /^(0|\+84)(1|2|3|4|5|6|7|8|9)\d{8}$/;

interface AccountFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender?: Gender;
  role?: Role;
  dateOfBirth: Dayjs;
  password: string;
  confirmPassword: string;
  dealerId?: string;
}

export type AccountCreatePayload = Omit<
  AccountFormValues,
  "dateOfBirth" | "confirmPassword"
> & { dateOfBirth: string };

interface Props {
  onSubmit: (values: AccountCreatePayload) => void;
  loading?: boolean;
  role: Role;
  defaultCreatingRole?: Role | null;
  form?: FormInstance<AccountFormValues>;
  dealerOptions?: { label: string; value: string }[];
}

export const AccountForm: React.FC<Props> = ({
  onSubmit,
  loading,
  role,
  defaultCreatingRole,
  form: outerForm,
  dealerOptions = [],
}) => {
  const [innerForm] = Form.useForm<AccountFormValues>();
  const form = outerForm ?? innerForm;

  const handleFinish = (values: AccountFormValues) => {
    const base: AccountCreatePayload = {
      fullName: trimEdges(values.fullName),
      email: toEmail(values.email),
      phone: toLocalPhone(values.phone),
      address: trimEdges(values.address),
      dateOfBirth: dayjs(values.dateOfBirth).format("YYYY-MM-DD"),
      password: values.password,
      gender: values.gender!,
    };

    if (role === Role.MANAGER) return onSubmit(base);

    const finalRole = defaultCreatingRole ?? values.role;
    onSubmit({
      ...base,
      ...(finalRole ? { role: finalRole } : {}),
      ...(finalRole === Role.MANAGER && values.dealerId
        ? { dealerId: values.dealerId }
        : {}),
    });
  };

  const showDealer = () =>
    role === Role.ADMIN && defaultCreatingRole === Role.MANAGER;

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      autoComplete="off"
      requiredMark="optional"
      validateTrigger="onSubmit"
      className="space-y-2"
    >
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[
          { required: true, message: "Vui lòng nhập họ và tên" },
          { min: 3, message: "Họ và tên phải có ít nhất 3 ký tự" },
          { max: 80, message: "Họ và tên quá dài" },
          {
            pattern: /^[\p{L}\s'.-]+$/u,
            message: "Họ tên chỉ được chứa chữ cái và khoảng trắng",
          },
        ]}
      >
        <Input allowClear placeholder="VD: Nguyễn Văn A" />
      </Form.Item>

      {role === Role.ADMIN && !defaultCreatingRole && (
        <Form.Item
          name="role"
          label="Vai trò"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select
            placeholder="Chọn vai trò"
            options={[
              { label: "Quản lý đại lý", value: Role.MANAGER },
              { label: "Nhân viên EVM", value: Role.EVM_STAFF },
            ]}
          />
        </Form.Item>
      )}

      {showDealer() && (
        <Form.Item
          name="dealerId"
          label="Đại lý quản lý"
          rules={[{ required: true, message: "Vui lòng chọn đại lý" }]}
        >
          <Select
            showSearch
            placeholder="Chọn đại lý"
            options={dealerOptions}
            optionFilterProp="label"
          />
        </Form.Item>
      )}

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { max: 100, message: "Email quá dài" },
          {
            validator: (_, value) => {
              const v = toEmail(value || "");
              if (!v) return Promise.resolve();
              const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
              if (!regex.test(v))
                return Promise.reject(new Error("Email không hợp lệ"));
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input allowClear placeholder="VD: nhanvien@emob.vn" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            validator: (_, value) => {
              const raw = stripPhone(value || "");
              if (!vnMobile.test(raw))
                return Promise.reject(new Error("Số điện thoại không hợp lệ"));
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input allowClear placeholder="VD: 0901234567" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[
          { required: true, message: "Vui lòng nhập địa chỉ" },
          { min: 10, message: "Địa chỉ quá ngắn" },
          { max: 255, message: "Địa chỉ quá dài" },
        ]}
      >
        <Input allowClear placeholder="VD: 123 Nguyễn Trãi, Quận 5" />
      </Form.Item>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        >
          <Select
            placeholder="Chọn giới tính"
            options={[
              { label: "Nam", value: Gender.MALE },
              { label: "Nữ", value: Gender.FEMALE },
              { label: "Khác", value: Gender.UNKNOWN },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[
            { required: true, message: "Vui lòng chọn ngày sinh" },

            /* ✅ Sửa: tuổi tối thiểu 18 */
            {
              validator(_, value: Dayjs) {
                if (!value) return Promise.resolve();

                const today = dayjs();
                const age = today.diff(value, "year");

                if (value.isAfter(today))
                  return Promise.reject(
                    new Error("Ngày sinh không thể là tương lai")
                  );

                if (age < 18)
                  return Promise.reject(new Error("Tuổi phải từ 18 trở lên"));

                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            placeholder="Chọn ngày sinh"
          />
        </Form.Item>
      </div>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu" },
          {
            pattern:
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[\w@$!%*?&]{8,}$/,
            message:
              "Tối thiểu 8 ký tự gồm chữ hoa, chữ thường, số & ký tự đặc biệt",
          },
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (getFieldValue("password") === value) return Promise.resolve();
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
            },
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>

      <div className="flex justify-center mt-5">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="px-6 py-2 rounded-md w-full sm:w-auto bg-evm-green hover:!bg-[#4f6f52]"
        >
          Tạo tài khoản
        </Button>
      </div>
    </Form>
  );
};
