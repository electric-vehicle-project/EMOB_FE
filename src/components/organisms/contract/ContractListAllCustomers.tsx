import { useEffect, useState } from "react";
import { Card, Select, Space, Input, Pagination, Dropdown, Button } from "antd";
import { SearchOutlined, SlidersOutlined } from "@ant-design/icons";
import { useContractQueryByDealer } from "../../../service/contractService";
import { ContractTable } from "../../molecules/contract/ContractTable";

const { Option } = Select;

export const ContractListAllCustomers = () => {
  // Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Filters (realtime)
  const [statuses, setStatuses] = useState<string[]>([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [keyword, setKeyword] = useState("");

  // Dropdown filter state
  const [filterOpen, setFilterOpen] = useState(false);

  // API query
  const { data, refetch } = useContractQueryByDealer(
    {},
    {
      page,
      size,
      sortField,
      sortDir,
      statuses,
      keyword,
    }
  );

  const contracts = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  useEffect(() => {
    refetch();
  });

  // ==========================
  // CUSTOM DROPDOWN FILTER PANEL
  // ==========================
  const FilterContent = () => {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
      >
        {/* STATUS */}
        <div>
          <b className="text-gray-700">Trạng thái</b>
          <Select
            mode="multiple"
            value={statuses}
            onChange={(v) => {
              setStatuses(v);
              setPage(0);
            }}
            allowClear
            className="w-full mt-2"
            placeholder="Chọn trạng thái"
          >
            <Option value="PENDING">Chờ xử lý</Option>
            <Option value="SIGNED">Đã ký</Option>
            <Option value="TERMINATED">Đã hủy</Option>
          </Select>
        </div>

        {/* SORT FIELD */}
        <div>
          <b className="text-gray-700">Sắp xếp theo</b>
          <Select
            value={sortField}
            onChange={(v) => {
              setSortField(v);
              setPage(0);
            }}
            className="w-full mt-2"
          >
            <Option value="createdAt">Ngày tạo</Option>
            <Option value="updatedAt">Ngày cập nhật</Option>
            <Option value="purchaseDate">Ngày ký kết</Option>
          </Select>
        </div>

        {/* SORT DIRECTION */}
        <div>
          <b className="text-gray-700">Thứ tự</b>
          <Select
            value={sortDir}
            onChange={(v) => {
              setSortDir(v);
              setPage(0);
            }}
            className="w-full mt-2"
          >
            <Option value="asc">Tăng dần</Option>
            <Option value="desc">Giảm dần</Option>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* PAGE HEADER */}
      

      {/* MAIN CARD */}
      <Card>
        <Space className="flex justify-start pb-5">
          {/* SEARCH */}
          <Input
            placeholder="Tìm kiếm theo mã hợp đồng..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 350 }}
          />

          {/* FILTER ICON WITH CUSTOM DROPDOWN */}
          <Dropdown
            trigger={["click"]}
            open={filterOpen}
            onOpenChange={setFilterOpen}
            dropdownRender={() => <FilterContent />}
          >
            <Button
              type="text"
              icon={<SlidersOutlined style={{ fontSize: 20 }} />}
              className="text-gray-600 hover:text-black"
            />
          </Dropdown>
        </Space>
        {/* TABLE */}
        <ContractTable data={contracts} page={0} size={0} total={0} />

        {/* PAGINATION */}
        <div className="p-3 flex justify-center">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={total}
            showSizeChanger={true}
            onChange={(newPage, newSize) => {
              setPage(newPage - 1);
              setSize(newSize);
            }}
            showTotal={(total) => `Tổng ${total} hợp đồng`}
          />
        </div>
      </Card>
    </div>
  );
};
