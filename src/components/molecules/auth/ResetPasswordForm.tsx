import { useState, useEffect } from "react";
import { Form } from "antd";
import { InputField } from "../../atoms/InputField";
import { ButtonPrimary } from "../../atoms/ButtonPrimary";
import { useNavigate } from "react-router-dom";
import { LockOutlined } from "@ant-design/icons";
import { useResetPasswordMutation } from "../../../service/authenticationService";
import { ROUTES } from "../../../model/routePaths";
import { toast } from "react-toastify";


export const ResetPasswordForm = () => {
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const { mutate: resetPasswordMutation } = useResetPasswordMutation();

  // --- Regex kiểm tra độ mạnh của mật khẩu ---
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[^\s]{8,20}$/;

  // --- Submit ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (values: any) => {
    const { newPassword } = values;
    resetPasswordMutation(
      { newPassword }, // body JSON
      {
        
        onSuccess: () => {
          setSuccess(true);

          // Bắt đầu đếm ngược 5s trước khi chuyển hướng
          const interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
          setTimeout(() => {
            clearInterval(interval);
            navigate(ROUTES.AUTH + "/" + ROUTES.LOGIN);
          }, 5000);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
          const msg =
            err?.response?.data?.toast || "Xảy ra lỗi, vui lòng thử lại sau!";
          toast.error(msg);
        },
      },
    );
  };

  // --- Khi đang ở trạng thái thành công, dừng form thao tác ---
  useEffect(() => {
    if (success) form.resetFields();
  }, [success]);

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleSubmit}
      className="space-y-6 pt-8"
    >
      {/* --- Mật khẩu mới --- */}
      <Form.Item
        name="newPassword"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu mới" },
          {
            pattern: passwordRegex,
            message:
              "Mật khẩu phải từ 8–20 ký tự, có ít nhất 1 chữ hoa, 1 ký tự đặc biệt và không chứa khoảng trắng",
          },
        ]}
        hasFeedback
      >
        <InputField
          className="h-13 !pl-5 !pr-5"
          prefix={<LockOutlined style={{ color: "#627254", fontSize: 19 }} />}
          type="password"
          placeholder="Nhập mật khẩu"
        />
      </Form.Item>

      {/* --- Xác nhận mật khẩu --- */}
      <Form.Item
        name="confirmPassword"
        dependencies={["newPassword"]}
        hasFeedback
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
            },
          }),
        ]}
      >
        <InputField
          className="h-13 !pl-5 !pr-5"
          prefix={<LockOutlined style={{ color: "#627254", fontSize: 19 }} />}
          type="password"
          placeholder="Xác nhận mật khẩu"
        />
      </Form.Item>

      {/* --- Nút đổi mật khẩu --- */}
      <Form.Item className="!pt-5">
        <ButtonPrimary className="!h-12 w-full" htmlType="submit">
          Đổi mật khẩu
        </ButtonPrimary>
      </Form.Item>

      {/* --- Thông báo thành công --- */}
      {success && (
        <div className="text-[#627254] text-center font-medium pt-2">
          <p>Đổi mật khẩu thành công!</p>
          <p>
            Chuyển hướng về trang đăng nhập sau{" "}
            <span className="font-semibold">{countdown}</span> giây...
          </p>
        </div>
      )}
    </Form>
  );
};
