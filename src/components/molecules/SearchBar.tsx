import { Input } from "antd";
import { useMemo, useEffect } from "react";
import debounce from "lodash/debounce";

interface Props {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder }: Props) => {
  // ✅ tạo debounce function chỉ 1 lần, phụ thuộc vào onSearch
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onSearch(value);
      }, 300),
    [onSearch]
  );

  // ✅ cleanup khi component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <Input
      placeholder={placeholder || "Tìm kiếm..."}
      onChange={(e) => debouncedSearch(e.target.value)}
      allowClear
    />
  );
};
