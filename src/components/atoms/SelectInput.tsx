import React from "react";
import { Form, Select } from "antd";
import type { FormItemProps } from "antd";
import type { SelectProps } from "antd/es/select";

interface Option {
  label: string;
  value: string | number;
}

interface SelectInputProps extends SelectProps {
  label: React.ReactNode;
  name: string;
  options: Option[];
  rules?: FormItemProps["rules"];
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  options,
  rules,
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules}>
      <Select {...rest}>
        {options.map((opt) => (
          <Select.Option key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SelectInput;
