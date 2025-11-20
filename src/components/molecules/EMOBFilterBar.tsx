import { Input, Dropdown, Button } from "antd";
import { SearchOutlined, SlidersOutlined } from "@ant-design/icons";

interface EMOBFilterBarProps {
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  filterDropdown: React.ReactNode;
  onReset?: () => void;
}

export const EMOBFilterBar = ({
  keyword,
  onKeywordChange,
  filterDropdown,
}: EMOBFilterBarProps) => {
  const showSearch =
    typeof keyword === "string" && typeof onKeywordChange === "function";

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Search */}
      {showSearch && (
        <Input
          placeholder="Tìm kiếm..."
          allowClear
          prefix={<SearchOutlined className="text-gray-400" />}
          value={keyword}
          onChange={(e) => onKeywordChange?.(e.target.value)}
          style={{ width: 320 }}
          className="rounded-md shadow-sm border-gray-300 focus:border-[#627254] focus:ring-[#627254]"
        />
      )}

      {/* Filter Dropdown */}
      <Dropdown
        trigger={["click"]}
        dropdownRender={() => (
          <div
            className="p-4 bg-white rounded-xl shadow-lg border border-gray-200 w-[260px]"
            onClick={(e) => e.stopPropagation()}
          >
            {filterDropdown}
          </div>
        )}
      >
        <Button
          type="text"
          icon={<SlidersOutlined style={{ fontSize: 20 }} />}
          className="text-gray-600 hover:text-black"
        />
      </Dropdown>
    </div>
  );
};
