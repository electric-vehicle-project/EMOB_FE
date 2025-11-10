// src/page/profile/ProfilePage.tsx
import React, { useMemo, useRef, useState } from "react";
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
  Progress,
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
const getStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const percent = Math.min(100, (score / 5) * 100);
  const label = percent >= 80 ? "Mạnh" : percent >= 60 ? "Trung bình" : "Yếu";
  const status: "exception" | "active" | "success" =
    percent >= 80 ? "success" : percent >= 60 ? "active" : "exception";
  return { percent, label, status };
};

const ChangePasswordTab: React.FC<{ email: string }> = ({ email }) => {
  const [form] = Form.useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();
  const changePassword = useChangePassword();
  const [newPwd, setNewPwd] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const strength = getStrength(newPwd);

  // enable/disable submit
  Form.useWatch([], form); // trigger re-render on change
  const hasErrors = form.getFieldsError().some((f) => f.errors.length);
  const canSubmit = !!form.isFieldsTouched(true) && !hasErrors;

  const onFinish = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Xác nhận mật khẩu không khớp");
      return;
    }
    if (values.newPassword === values.currentPassword) {
      message.error("Mật khẩu mới không được trùng mật khẩu hiện tại");
      return;
    }

    try {
      // Xác thực currentPassword
      await api.post("/auth/login", {
        email,
        password: values.currentPassword,
      });

      // Reset password
      await changePassword.mutateAsync({ newPassword: values.newPassword });

      message.success("Đổi mật khẩu thành công");
      form.resetFields();
      setNewPwd("");
    } catch (error) {
      const isApiError =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response;
      const msg = isApiError
        ? (error.response as { data?: { message?: string } })?.data?.message ||
          "Đổi mật khẩu thất bại"
        : "Đổi mật khẩu thất bại";
      message.error(msg);
    }
  };

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        validateTrigger={["onChange", "onBlur"]}
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
            placeholder="Nhập mật khẩu hiện tại"
            className="!rounded-xl"
            onKeyUp={(e) => {
              if (e.nativeEvent instanceof KeyboardEvent) {
                setCapsLock(e.nativeEvent.getModifierState("CapsLock"));
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: "Phải có chữ hoa, chữ thường và số",
            },
          ]}
        >
          <>
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              className="!rounded-xl"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              onKeyUp={(e) => {
                if (e.nativeEvent instanceof KeyboardEvent) {
                  setCapsLock(e.nativeEvent.getModifierState("CapsLock"));
                }
              }}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {capsLock ? "⚠️ CapsLock đang bật" : " "}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{strength.label}</span>
                <Progress
                  percent={strength.percent}
                  size="small"
                  status={strength.status}
                  showInfo={false}
                  className="min-w-[100px]"
                />
              </div>
            </div>
          </>
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value)
                  return Promise.resolve();
                return Promise.reject(
                  new Error("Xác nhận mật khẩu không khớp")
                );
              },
            }),
          ]}
        >
          <Input.Password
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
            disabled={!canSubmit}
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

  // only MANAGER / DEALER_STAFF may have dealerId to show dealer name
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

  // If profile not ready
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
    // Baseline ref to compare diffs reliably
    const baselineRef = useRef<NormalizedProfile>({
      fullName: profile.fullName?.trim() || "",
      phone: profile.phone?.trim() || "",
      gender: profile.gender,
      address: profile.address?.trim() || "",
      dateOfBirth: profile.dateOfBirth || "",
    });

    // initial values for the form
    const initialValues: ProfileFormValues = {
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      gender: profile.gender,
      address: profile.address || "",
      dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,
    };

    // watch all fields -> re-render when any changes
    const watched = Form.useWatch([], form);
    const currentValues: ProfileFormValues =
      watched || (initialValues as ProfileFormValues);

    const currentNorm = useMemo(
      () => normalize(currentValues),
      [currentValues]
    );

    // Recalculate errors when form values change (watched triggers re-render)
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

        message.success("Cập nhật thông tin thành công");
        if (updated) {
          // update redux
          dispatch(loginAction(updated));
          // refresh baseline with current normalized values
          baselineRef.current = normalize({
            ...values,
            email: profile.email,
          });
        }
      } catch (err) {
        // Check if it's a form validation error (has errorFields)
        const isValidationError =
          err && typeof err === "object" && "errorFields" in err;

        if (!isValidationError) {
          // It's an API error, extract message if available
          const isApiError =
            err &&
            typeof err === "object" &&
            "response" in err &&
            err.response &&
            typeof err.response === "object" &&
            "data" in err.response;
          const errorMessage = isApiError
            ? (err.response as { data?: { message?: string } })?.data
                ?.message || "Cập nhật thất bại, vui lòng thử lại"
            : "Cập nhật thất bại, vui lòng thử lại";
          message.error(errorMessage);
        }
      }
    };

    return (
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <Form
          key={profile.id || profile.email} // re-init when profile updates
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={initialValues}
          validateTrigger={["onChange", "onBlur"]}
        >
          {/* Header info row (name + status + role + dealer) */}
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
            {/* Fullname */}
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

            {/* Email (disabled) */}
            <Form.Item label="Email" name="email">
              <Input
                disabled
                prefix={<MailOutlined />}
                className="!rounded-full !px-4 !py-2"
              />
            </Form.Item>

            {/* Phone */}
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

            {/* Gender */}
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

            {/* Date of birth */}
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

            {/* Address */}
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

  /* ---------- Render Page with Tabs ---------- */
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
