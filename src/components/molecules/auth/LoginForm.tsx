import { Checkbox, Form } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useLoginMutation } from "../../../service/authenticationService";
import { login } from "../../../redux/features/userSlice";
import { InputField } from "../../atoms/InputField";
import { ButtonPrimary } from "../../atoms/ButtonPrimary";
import { ButtonGoogle } from "../../atoms/ButtonGoogle";

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: loginMutation, isPending } = useLoginMutation();
  const [form] = Form.useForm<LoginFormValues>();

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      const { username, password } = JSON.parse(savedUser);
      form.setFieldsValue({
        username,
        password,
        remember: true,
      });
    }
  }, [form]);

  const handleLogin = (values: LoginFormValues) => {
    const { username, password, remember } = values;
    const trimmedUsername = username.trim();

    loginMutation(
      { email: trimmedUsername, password },
      {
        onSuccess: (res) => {
          const { token, refreshToken, ...user } = res.data.result;

          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);
          dispatch(login(user));

          if (remember) {
            localStorage.setItem(
              "rememberedUser",
              JSON.stringify({ username, password })
            );
          } else {
            localStorage.removeItem("rememberedUser");
          }

          toast.success("Đăng nhập thành công!");
          navigate(`/${user.role.toLowerCase()}`);
        },
        onError: () => {
          form.setFields([
            { name: "username", errors: [""] },
            {
              name: "password",
              errors: ["Tên đăng nhập hoặc mật khẩu không đúng"],
            },
          ]);
        },
      }
    );
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleLogin}
      className="space-y-5"
    >
      {/* --- Username --- */}
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
      >
        <InputField
          prefix={<UserOutlined style={{ color: "#627254", fontSize: 19 }} />}
          className="h-13 !pl-5 !pr-5"
          type="text"
          placeholder="Tên đăng nhập"
        />
      </Form.Item>

      {/* --- Password --- */}
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
      >
        <InputField
          className="h-13 !pl-5 !pr-5"
          prefix={<LockOutlined style={{ color: "#627254", fontSize: 19 }} />}
          type="password"
          placeholder="Mật khẩu"
        />
      </Form.Item>

      {/* --- Remember & Forget --- */}
      <div className="flex justify-between items-center px-5">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox className="!text-[var(--primary-color)]">
            Ghi nhớ mật khẩu
          </Checkbox>
        </Form.Item>

        <Link to="/auth/forget-password">
          <p className="text-sm text-[var(--primary-color)] hover:underline">
            Quên mật khẩu?
          </p>
        </Link>
      </div>

      {/* --- Submit --- */}
      <Form.Item>
        <ButtonPrimary
          className="!h-12 w-full"
          htmlType="submit"
          disabled={isPending}
        >
          {isPending ? "Đang xử lý..." : "Đăng nhập"}
        </ButtonPrimary>
      </Form.Item>

      {/* --- Google login --- */}
      <Form.Item>
        <ButtonGoogle />
      </Form.Item>
    </Form>
  );
};
