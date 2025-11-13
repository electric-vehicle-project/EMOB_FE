import { Input, Dropdown, Button } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

interface EMOBFilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  filterDropdown: React.ReactNode;
  onReset?: () => void;
}

export const EMOBFilterBar = ({
  keyword,
  onKeywordChange,
  filterDropdown,
  onReset,
}: EMOBFilterBarProps) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Search Box */}
      <Input
        allowClear
        size="large"
        placeholder="Tìm kiếm..."
        prefix={<SearchOutlined className="text-gray-400" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        className="rounded-full h-11 max-w-md px-4"
        style={{
          borderRadius: 9999,
          height: 34,
        }}
      />

      {/* Filter Button */}
      <Dropdown
        trigger={["click"]}
        dropdownRender={() => (
          <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-72">
            {filterDropdown}

            {/* RESET BUTTON */}
            <div className="flex justify-end mt-4">
              <Button type="primary" onClick={onReset}>
                Đặt lại
              </Button>
            </div>
          </div>
        )}
      >
        <div
          className="cursor-pointer flex items-center justify-center hover:bg-gray-100"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
          }}
        >
          <FilterOutlined style={{ fontSize: 26, color: "#000" }} />
        </div>
      </Dropdown>
    </div>
  );
};
