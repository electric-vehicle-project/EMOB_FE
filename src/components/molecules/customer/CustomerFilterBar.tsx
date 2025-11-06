import { Input } from "antd";

interface Props {
  keyword: string;
  onKeywordChange: (value: string) => void;
}

export const CustomerFilterBar = ({ keyword, onKeywordChange }: Props) => (
  <div className="flex items-center mb-5">
    <Input
      placeholder="Tìm kiếm theo tên, email, hoặc số điện thoại..."
      allowClear
      value={keyword}
      onChange={(e) => onKeywordChange(e.target.value)}
      className="w-full sm:max-w-[420px]"
      style={{ borderColor: "#627254" }}
    />
  </div>
);
