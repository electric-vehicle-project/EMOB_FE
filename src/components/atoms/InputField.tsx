import React from "react";
import { Input } from "antd";
import type { InputProps } from "antd";

type InputFieldType = "text" | "password" | "username";

interface InputFieldProps extends Omit<InputProps, "type"> {
  type?: InputFieldType;
  placeholder: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  style,
  ...rest
}) => {
  const commonProps: InputProps = {
    placeholder,
    value,
    onChange,
    style: { color: "var(--primary-color)", ...style },
    ...rest,
  };

  if (type === "password") {
    return <Input.Password {...commonProps} />;
  }

  // type "text" và "username" đều dùng Input thường
  return <Input {...commonProps} />;
};
