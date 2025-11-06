// src/components/molecules/Account/AccountForm.tsx
import { useMemo, useState } from "react";
import { Form, Input, Select, DatePicker, Button } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Gender, Role } from "../../../model/Account";
import type { FormInstance } from "antd/es/form";

/* ===== Helpers ===== */
const trimEdges = (s: string) => (s ?? "").replace(/^\s+|\s+$/g, "");
const toEmail = (s: string) => trimEdges(s).toLowerCase();
const stripPhone = (s: string) => (s ?? "").replace(/[^\d+]/g, "");
const toIntlPhone = (s: string) => {
  const raw = stripPhone(s);
  if (raw.startsWith("+84")) return raw;
  if (raw.startsWith("0")) return `+84${raw.slice(1)}`;
  return raw;
};
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
  gender: Gender;
  role?: Role; // chỉ dùng khi ADMIN chọn loại tài khoản
  dateOfBirth: Dayjs;
  password: string;
  confirmPassword: string;
  dealerId?: string; // chỉ bắt buộc khi ADMIN tạo MANAGER
}

export type AccountCreatePayload = Omit<
  AccountFormValues,
  "dateOfBirth" | "confirmPassword"
> & {
  dateOfBirth: string;
};

interface Props {
  onSubmit: (values: AccountCreatePayload) => void;
  loading?: boolean;
  role: Role; // role của người tạo (ADMIN | MANAGER)
  defaultCreatingRole?: Role | null; // nếu ADMIN đã chọn trước loại tạo
  form?: FormInstance<AccountFormValues>;
  /** Chỉ truyền khi ADMIN tạo MANAGER (để user chọn Dealer). Manager không cần prop này. */
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

  /** Tập kiểm tra trùng email/phone phía FE (có sẵn để reuse) */
  const dupSets = useMemo(() => {
    return { emails: new Set<string>(), phones: new Set<string>() };
  }, []);

  const [canSubmit, setCanSubmit] = useState(false);

  const handleFinish = (values: AccountFormValues) => {
    const base: AccountCreatePayload = {
      fullName: trimEdges(values.fullName),
      email: toEmail(values.email),
      phone: toLocalPhone(values.phone),
      address: trimEdges(values.address),
      dateOfBirth: dayjs(values.dateOfBirth).format("YYYY-MM-DD"),
      password: values.password,
      gender: values.gender,
    };

    // Manager tạo Dealer Staff -> không gửi role/dealerId
    if (role === Role.MANAGER) {
      onSubmit(base);
      form.resetFields();
      setCanSubmit(false);
      return;
    }

    // Admin tạo
    const finalRole = defaultCreatingRole ?? (values.role as Role | undefined);
    const payloadForAdmin: AccountCreatePayload = {
      ...base,
      ...(finalRole ? ({ role: finalRole } as { role: Role }) : {}),
      ...(finalRole === Role.MANAGER && values.dealerId
        ? ({ dealerId: values.dealerId } as { dealerId: string })
        : {}),
    };

    onSubmit(payloadForAdmin);
    form.resetFields();
    setCanSubmit(false);
  };

  const genderOptions = [
    { label: "Nam", value: Gender.MALE },
    { label: "Nữ", value: Gender.FEMALE },
    { label: "Khác", value: Gender.UNKNOWN },
  ];

  // ❗️Quy tắc hiển thị chọn đại lý:
  // - Manager tạo dealer staff: KHÔNG hiển thị (BE tự gán theo manager)
  // - Admin tạo Manager: BẮT BUỘC chọn dealer
  // - Admin tạo EVM_STAFF: KHÔNG cần dealer
  const shouldShowDealerSelect = () => {
    if (role === Role.MANAGER) return false;
    if (role === Role.ADMIN && defaultCreatingRole === Role.MANAGER)
      return true;
    return false;
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      autoComplete="off"
      requiredMark="optional"
      className="space-y-2"
      initialValues={{ gender: Gender.UNKNOWN }} // ✅ đảm bảo có giá trị mặc định
      onFieldsChange={() => {
        const hasErrors = form
          .getFieldsError()
          .some((f) => f.errors.length > 0);
        setCanSubmit(!hasErrors && form.isFieldsTouched(true));
      }}
    >
      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[
          { required: true, message: "Vui lòng nhập họ và tên" },
          { min: 3, message: "Họ và tên phải có ít nhất 3 ký tự" },
          { max: 80, message: "Họ và tên quá dài (tối đa 80 ký tự)" },
          {
            pattern: /^[\p{L}\s'.-]+$/u,
            message: "Họ tên chỉ được chứa chữ cái và khoảng trắng",
          },
        ]}
      >
        <Input placeholder="VD: Nguyễn Văn A" allowClear />
      </Form.Item>

      {/* ADMIN chọn loại tài khoản nếu chưa cố định trước */}
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

      {/* ADMIN tạo Manager -> bắt buộc chọn Dealer */}
      {shouldShowDealerSelect() && (
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
          { max: 100, message: "Email quá dài (tối đa 100 ký tự)" },
          {
            validator: (_, value: string) => {
              const v = toEmail(value || "");
              if (!v) return Promise.resolve();
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
              if (!emailRegex.test(v))
                return Promise.reject(new Error("Email không hợp lệ"));
              if (dupSets.emails.has(v))
                return Promise.reject(
                  new Error("Email đã tồn tại trong hệ thống!")
                );
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="VD: nhanvien@emob.vn" allowClear />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          { max: 30, message: "Số điện thoại quá dài" },
          {
            validator: (_, value: string) => {
              const raw = stripPhone(value || "");
              if (!raw) return Promise.resolve();
              if (!vnMobile.test(raw))
                return Promise.reject(
                  new Error(
                    "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)"
                  )
                );
              const intl = toIntlPhone(raw);
              const local = toLocalPhone(raw);
              if (dupSets.phones.has(intl) || dupSets.phones.has(local))
                return Promise.reject(
                  new Error("Số điện thoại đã tồn tại trong hệ thống!")
                );
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="VD: 0901234567" allowClear />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[
          { required: true, message: "Vui lòng nhập địa chỉ" },
          { min: 10, message: "Địa chỉ quá ngắn, vui lòng nhập chi tiết hơn" },
          { max: 255, message: "Địa chỉ quá dài (tối đa 255 ký tự)" },
          {
            pattern: /^[\p{L}\d\s,.'-]+$/u,
            message:
              "Địa chỉ chỉ được chứa chữ, số, dấu phẩy, chấm, hoặc gạch nối",
          },
        ]}
      >
        <Input placeholder="VD: 123 Nguyễn Trãi, Quận 5, TP.HCM" allowClear />
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
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[
            { required: true, message: "Vui lòng chọn ngày sinh" },
            {
              validator: (_, value: Dayjs) => {
                if (!value) return Promise.resolve();
                const today = dayjs();
                if (value.isAfter(today))
                  return Promise.reject(
                    new Error("Ngày sinh không thể là tương lai")
                  );
                const age = today.diff(value, "year");
                if (age < 14)
                  return Promise.reject(new Error("Tuổi tối thiểu là 14"));
                if (age > 100)
                  return Promise.reject(
                    new Error("Tuổi tối đa cho phép là 100")
                  );
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            placeholder="Chọn ngày sinh"
            disabledDate={(current) =>
              !!current && current > dayjs().endOf("day")
            }
          />
        </Form.Item>
      </div>

      <Form.Item
        name="password"
        label="Mật khẩu"
        validateTrigger="onChange"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu" },
          {
            pattern:
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[\w@$!%*?&]{8,}$/,
            message:
              "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
          },
        ]}
      >
        <Input.Password
          placeholder="Nhập mật khẩu"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        dependencies={["password"]}
        validateTrigger="onChange"
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value)
                return Promise.resolve();
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
            },
          }),
        ]}
      >
        <Input.Password
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
        />
      </Form.Item>

      <div className="flex justify-center mt-5">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={!canSubmit}
          className={`px-6 py-2 rounded-md w-full sm:w-auto transition-all duration-150 ${
            !canSubmit
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-evm-green hover:!bg-[#4f6f52]"
          }`}
        >
          Tạo tài khoản
        </Button>
      </div>
    </Form>
  );
};
