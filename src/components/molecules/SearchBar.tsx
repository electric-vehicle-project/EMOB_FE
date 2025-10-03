import { Input } from "antd";

interface Props {
  onSearch: (value: string) => void;
}

export const SearchBar = ({ onSearch }: Props) => (
  <Input.Search
    placeholder="Tìm kiếm đại lý..."
    onSearch={onSearch}
    enterButton
  />
);
