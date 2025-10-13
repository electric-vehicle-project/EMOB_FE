import { Checkbox, Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { ButtonGoogle } from "../atoms/ButtonGoogle";
import { useNavigate, Link } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { loginService } from "../../service/authenticationService";
import { toast } from "react-toastify";

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const loginMutation = loginService();
  const [form] = Form.useForm<LoginFormValues>();

  const handleLogin = async (values: LoginFormValues) => {
    const { email, password } = values;
    console.log(values);
    if (email && password) {
      // Luồng đang là auto thành công, điều hướng về /x/dashboard với x là role của account vừa log
      // hiện tại mặc định về dashboard
      const response = await loginMutation.mutateAsync(
        {
          email,
          password,
        },
        {
          onSuccess: (data) => {
            // Handle successful login
            toast.success("Dang nhap thanh cong");
            navigate("/dashboard");
          },
          onError: (error) => {
            // Handle login error
            toast.error("Sai thong tin dang nhap");
          },
        }
      );
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleLogin}
      className="space-y-5"
    >
      {/* --- Username Field --- */}
      <Form.Item
        name="email"
        rules={[{ required: true, message: "Vui lòng nhập Email" }]}
      >
        <InputField
          prefix={<UserOutlined style={{ color: "#627254", fontSize: 19 }} />}
          className="h-13"
          placeholder="Email"
        />
      </Form.Item>

      {/* --- Password Field --- */}
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
      >
        <InputField
          className="h-13"
          prefix={<LockOutlined style={{ color: "#627254", fontSize: 19 }} />}
          type="password"
          placeholder="Mật khẩu"
        />
      </Form.Item>

      {/* --- Ghi nhớ & Quên mật khẩu --- */}
      <div className="flex justify-between items-center px-5">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox className="!text-[var(--primary-color)]">
            Ghi nhớ mật khẩu
          </Checkbox>
        </Form.Item>

        <Link to="/auth/forget-password">
          <p className="text-sm font-bold text-[var(--primary-color)]">
            Quên mật khẩu?
          </p>
        </Link>
      </div>

      {/* --- Nút đăng nhập --- */}
      <Form.Item>
        <ButtonPrimary htmlType="submit" className="!h-12 w-full">
          Đăng nhập
        </ButtonPrimary>
      </Form.Item>

      {/* --- Đăng nhập bằng Google --- */}
      <Form.Item>
        <ButtonGoogle />
      </Form.Item>
    </Form>
  );
};
