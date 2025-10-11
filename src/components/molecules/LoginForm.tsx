import { Checkbox, Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { ButtonGoogle } from "../atoms/ButtonGoogle";
import { useNavigate, Link } from "react-router-dom";

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginFormValues>();

  const handleLogin = (values: LoginFormValues) => {
    const { username, password } = values;

    if (username && password) {
      // Luồng đang là auto thành công, điều hướng về /x/dashboard với x là role của account vừa log
      // hiện tại mặc định về dashboard
      navigate("/dashboard");
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
        className=""
        name="username"
        label="Tên đăng nhập"
        rules={[
          { required: true, message: "Vui lòng nhập tên đăng nhập" },
        ]}
      >
        <InputField type="username" placeholder="Tên đăng nhập" />
      </Form.Item>

      {/* --- Password Field --- */}
      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu" },
        ]}
      >
        <InputField type="password" placeholder="Mật khẩu" />
      </Form.Item>

      {/* --- Ghi nhớ & Quên mật khẩu --- */}
      <div className="flex justify-between items-center px-5">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox className="text-[#627254]">Ghi nhớ mật khẩu</Checkbox>
        </Form.Item>


        <Link to="/auth/forget-password">
          <p className="text-sm text-[#627254]">
            Quên mật khẩu?
          </p>
        </Link>
      </div>

      {/* --- Nút đăng nhập --- */}
      <Form.Item>
        <ButtonPrimary >Đăng nhập</ButtonPrimary>
      </Form.Item>

      {/* --- Đăng nhập bằng Google --- */}
      <Form.Item>
        <ButtonGoogle />
      </Form.Item>
    </Form>
  );
};
