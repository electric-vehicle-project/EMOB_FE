// src/components/molecules/SearchBar.tsx
import { Input } from "antd";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder }: Props) => {
  return (
    <Input
      value={value}
      placeholder={placeholder || "Tìm kiếm..."}
      onChange={(e) => onChange(e.target.value)}
      allowClear
    />
  );
};
