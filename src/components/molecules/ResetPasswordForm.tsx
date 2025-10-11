import { useState, useEffect } from "react";
import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate } from "react-router-dom";

export const ResetPasswordForm = () => {
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // --- Regex kiểm tra độ mạnh của mật khẩu ---
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[^\s]{8,20}$/;

  // --- Khi submit form ---
  const handleSubmit = (values: any) => {
    // const { password } = values;
    setSuccess(true);

    // Bắt đầu đếm ngược 5s trước khi chuyển hướng
    const interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    setTimeout(() => {
      clearInterval(interval);
      navigate("/auth/login");
    }, 5000);
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
        name="password"
        label="Mật khẩu mới"
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
        <InputField type="password" placeholder="Nhập mật khẩu mới" />
      </Form.Item>

      {/* --- Xác nhận mật khẩu --- */}
      <Form.Item
        name="confirmPassword"
        label="Xác nhận mật khẩu mới"
        dependencies={["password"]}
        hasFeedback
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Mật khẩu xác nhận không khớp")
              );
            },
          }),
        ]}
      >
        <InputField type="password" placeholder="Xác nhận mật khẩu mới" />
      </Form.Item>

      {/* --- Nút đổi mật khẩu --- */}
      <Form.Item className="!pt-5">
        <ButtonPrimary onClick={(handleSubmit)}>Đổi mật khẩu</ButtonPrimary>
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
