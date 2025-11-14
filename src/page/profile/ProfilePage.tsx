// src/page/profile/ProfilePage.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Typography,
  Space,
  Divider,
  message,
  Tag,
  Skeleton,
  Tabs,
  Modal, // ✅ thêm Modal để bật popup cảnh báo
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  SketchOutlined,
  SaveOutlined,
  KeyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { useCurrentUser } from "../../utils/getCurrentUser";
import type {
  IAccount,
  Gender,
  Role,
  AccountStatus,
} from "../../model/Account";
import {
  useUpdateAccountProfile,
  useChangePassword,
} from "../../service/accountService";
import { useDealerByIdQuery } from "../../service/dealerService";
import { login as loginAction } from "../../redux/features/userSlice";
import { Button } from "../../components/atoms/Button";
import { CardWrapper } from "../../components/template/CardWrapper";
import api from "../../config/api";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

/* =================== Constants =================== */
const genderOptions = [
  { label: "Nam", value: "MALE", icon: <ManOutlined /> },
  { label: "Nữ", value: "FEMALE", icon: <WomanOutlined /> },
  { label: "Không xác định", value: "UNKNOWN", icon: <SketchOutlined /> },
];

const phoneRegex = /^(\+?\d{7,15})$/;

const roleLabel: Record<Role, string> = {
  ADMIN: "Quản trị (Hãng xe)",
  MANAGER: "Quản lý đại lý",
  DEALER_STAFF: "Nhân viên đại lý",
  EVM_STAFF: "Nhân viên EVM",
};

const statusLabel: Record<AccountStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  BANNED: "Đã khóa",
};

const statusColor: Record<AccountStatus, string> = {
  ACTIVE: "green",
  INACTIVE: "gold",
  BANNED: "red",
};

/* =================== Types & helpers =================== */
type ProfileFormValues = {
  fullName: string;
  email: string; // read-only
  phone: string;
  gender: Gender;
  dateOfBirth?: dayjs.Dayjs;
  address: string;
};

type NormalizedProfile = {
  fullName: string;
  phone: string;
  gender: Gender;
  address: string;
  dateOfBirth: string; // YYYY-MM-DD or ""
};

const normalize = (v: ProfileFormValues): NormalizedProfile => ({
  fullName: (v.fullName || "").trim(),
  phone: (v.phone || "").trim(),
  gender: v.gender,
  address: (v.address || "").trim(),
  dateOfBirth: v.dateOfBirth ? v.dateOfBirth.format("YYYY-MM-DD") : "",
});

const shallowEqual = (a: NormalizedProfile, b: NormalizedProfile) =>
  a.fullName === b.fullName &&
  a.phone === b.phone &&
  a.gender === b.gender &&
  a.address === b.address &&
  a.dateOfBirth === b.dateOfBirth;

/* =================== Change Password Tab =================== */
// Helper: extract API error message safely
const getApiErrorMessage = (err: unknown): string | undefined => {
  if (typeof err === "object" && err !== null && "response" in err) {
    const resp = (err as { response?: { data?: { message?: string } } })
      .response;
    return resp?.data?.message;
  }
  return undefined;
};

const ChangePasswordTab: React.FC<{ email: string }> = ({ email }) => {
  const [form] = Form.useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();
  const changePassword = useChangePassword();

  const clean = (s: string) =>
    (s ?? "")
      .normalize("NFKC")
      .replace(
        /[\u00A0\u2000-\u200F\u2028\u202F\u205F\u2060-\u206F\uFEFF]/g,
        ""
      )
      .trim();

  // 🔍 State theo dõi hai ô mới và xác nhận
  const newPassword = Form.useWatch("newPassword", form) ?? "";
  const confirmPassword = Form.useWatch("confirmPassword", form) ?? "";

  // ✅ Auto validate khi 2 ô thay đổi
  useEffect(() => {
    const next = clean(newPassword);
    const cf = clean(confirmPassword);
    if (!cf) return;
    if (next === cf) {
      form.setFields([{ name: "confirmPassword", errors: [] }]);
    } else {
      form.setFields([
        { name: "confirmPassword", errors: ["Xác nhận mật khẩu không khớp"] },
      ]);
    }
  }, [newPassword, confirmPassword, form]);

  const onFinish = async (v: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const current = clean(v.currentPassword);
    const next = clean(v.newPassword);
    const confirm = clean(v.confirmPassword);

    if (next !== confirm) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }
    if (current === next) {
      Modal.warning({
        title: "Mật khẩu mới trùng mật khẩu hiện tại",
        content: "Vui lòng dùng mật khẩu khác.",
        okText: "Đã hiểu",
      });
      return;
    }

    try {
      await api.post("/auth/login", { email, password: current });
      await changePassword.mutateAsync({ newPassword: next });
      toast.success("Đổi mật khẩu thành công");
      form.resetFields();
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e) || "Đổi mật khẩu thất bại";
      toast.error(msg);
    }
  };

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        validateTrigger={["onBlur", "onSubmit"]}
      >
        <Title level={5} className="!mt-0">
          Đổi mật khẩu
        </Title>
        <Divider className="!my-3" />

        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password
            autoComplete="current-password"
            placeholder="Nhập mật khẩu hiện tại"
            className="!rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          dependencies={["currentPassword"]}
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: "Phải có chữ hoa, chữ thường và số",
            },
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            placeholder="Nhập mật khẩu mới"
            className="!rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
        >
          <Input.Password
            autoComplete="off"
            placeholder="Nhập lại mật khẩu mới"
            className="!rounded-xl"
          />
        </Form.Item>

        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<KeyOutlined />}
            loading={changePassword.isPending}
            onClick={() => form.submit()}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </Form>
    </Card>
  );
};

/* =================== Main Page with Tabs =================== */
export default function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useCurrentUser();
  const updateProfile = useUpdateAccountProfile();

  const canQueryDealerName =
    (profile?.role === "MANAGER" || profile?.role === "DEALER_STAFF") &&
    !!profile?.dealerId;

  const dealerQuery = useDealerByIdQuery(profile?.dealerId as string, {
    enabled: canQueryDealerName,
  });

  const dealerName: string | undefined = useMemo(() => {
    const d = dealerQuery.data?.result ?? dealerQuery.data;
    return d?.name || undefined;
  }, [dealerQuery.data]);

  if (!profile) {
    return (
      <CardWrapper
        title="Hồ sơ cá nhân"
        subtitle="Thông tin tài khoản & bảo mật"
        maxWidth="max-w-5xl"
        variant="profile"
      >
        <Skeleton active />
      </CardWrapper>
    );
  }

  /* ---------- Edit Profile Tab ---------- */
  const EditProfileTab: React.FC = () => {
    const [form] = Form.useForm<ProfileFormValues>();
    const baselineRef = useRef<NormalizedProfile>({
      fullName: profile.fullName?.trim() || "",
      phone: profile.phone?.trim() || "",
      gender: profile.gender,
      address: profile.address?.trim() || "",
      dateOfBirth: profile.dateOfBirth || "",
    });

    const initialValues: ProfileFormValues = {
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      gender: profile.gender,
      address: profile.address || "",
      dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,
    };

    const watched = Form.useWatch([], form);
    const currentValues: ProfileFormValues =
      watched || (initialValues as ProfileFormValues);

    const currentNorm = useMemo(
      () => normalize(currentValues),
      [currentValues]
    );

    const hasErrors = form.getFieldsError().some((f) => f.errors.length);
    const hasDiff = useMemo(
      () => !shallowEqual(currentNorm, baselineRef.current),
      [currentNorm]
    );

    const handleSave = async () => {
      try {
        const values = (await form.validateFields()) as ProfileFormValues;
        const payload = {
          fullName: values.fullName.trim(),
          gender: values.gender,
          address: values.address.trim(),
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : baselineRef.current.dateOfBirth || undefined,
          phone: values.phone.trim(),
        };

        const resp = await updateProfile.mutateAsync(payload);
        const updated: IAccount | undefined =
          resp?.data?.result ?? resp?.data ?? undefined;

        toast.success("Cập nhật thông tin thành công");
        if (updated) {
          dispatch(loginAction(updated));
          baselineRef.current = normalize({
            ...values,
            email: profile.email,
          });
        }
      } catch (err: unknown) {
        const isValidationError =
          err && typeof err === "object" && "errorFields" in err;

        if (!isValidationError) {
          const errorMessage =
            getApiErrorMessage(err) || "Cập nhật thất bại, vui lòng thử lại";
          toast.error(errorMessage);
        }
      }
    };

    return (
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <Form
          key={profile.id || profile.email}
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={initialValues}
          validateTrigger={["onChange", "onBlur"]}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <UserOutlined />
              <Title level={5} className="!m-0">
                {profile.fullName}
              </Title>
            </div>
            <Space size="small" wrap>
              <Text type="secondary">
                <MailOutlined /> {profile.email}
              </Text>
              <Tag color={statusColor[profile.status]}>
                {statusLabel[profile.status]}
              </Tag>
              <Tag>{roleLabel[profile.role]}</Tag>
              {(profile.role === "MANAGER" ||
                profile.role === "DEALER_STAFF") && (
                <Tag color="purple">
                  {dealerQuery.isFetching
                    ? "Đang lấy đại lý..."
                    : dealerName || "Chưa có đại lý"}
                </Tag>
              )}
            </Space>
          </div>

          <Divider className="!my-3" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên" },
                { min: 2, message: "Họ và tên tối thiểu 2 ký tự" },
              ]}
            >
              <Input
                placeholder="Nhập họ và tên"
                className="!rounded-full !px-4 !py-2"
              />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input
                disabled
                prefix={<MailOutlined />}
                className="!rounded-full !px-4 !py-2"
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: phoneRegex, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input
                placeholder="+84xxxxxxxx"
                prefix={<PhoneOutlined />}
                className="!rounded-full !px-4 !py-2"
              />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select
                placeholder="Chọn giới tính"
                className="!rounded-full"
                options={genderOptions.map((o) => ({
                  label: (
                    <span className="flex items-center gap-2">
                      {o.icon} {o.label}
                    </span>
                  ),
                  value: o.value,
                }))}
              />
            </Form.Item>

            <Form.Item label="Ngày sinh" name="dateOfBirth">
              <DatePicker
                className="w-full !rounded-full !px-4 !py-2"
                format="YYYY-MM-DD"
                allowClear
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
                placeholder="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ" },
                { min: 3, message: "Địa chỉ tối thiểu 3 ký tự" },
              ]}
            >
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 4 }}
                className="!rounded-xl !px-3 !py-2 resize-none"
                maxLength={250}
                showCount
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
              />
            </Form.Item>
          </div>

          <Divider />

          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={updateProfile.isPending}
              disabled={!hasDiff || hasErrors}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    );
  };

  return (
    <CardWrapper
      title="Hồ sơ cá nhân"
      subtitle="Thông tin tài khoản & bảo mật"
      maxWidth="max-w-5xl"
      variant="profile"
    >
      <Tabs
        defaultActiveKey="profile"
        items={[
          {
            key: "profile",
            label: "Chỉnh sửa hồ sơ",
            children: <EditProfileTab />,
          },
          {
            key: "password",
            label: "Đổi mật khẩu",
            children: <ChangePasswordTab email={profile.email} />,
          },
        ]}
      />
    </CardWrapper>
  );
}
