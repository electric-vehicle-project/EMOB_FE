import React from "react";
import { Input } from "antd";
import type { InputProps, PasswordProps } from "antd/es/input";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

// ✅ Kế thừa kiểu gốc từ Ant Design để tương thích tuyệt đối
type Props = (InputProps | PasswordProps) & {
  type?: "text" | "password";
  placeholder: string;
};

export const InputField: React.FC<Props> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  ...rest
}) => {
  return type === "password" ? (
    <Input.Password
      className="!h-full w-full"
      prefix={<LockOutlined />}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...(rest as PasswordProps)} // 👈 ép kiểu về PasswordProps
    />
  ) : (
    <Input
      className="!h-full w-full"
      prefix={<UserOutlined />}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...(rest as InputProps)} // 👈 ép kiểu về InputProps
    />
  );
};
