import { Input } from "antd";
import type { FC } from "react";

interface Props {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: FC<Props> = ({ ...rest }) => <Input {...rest} />;
