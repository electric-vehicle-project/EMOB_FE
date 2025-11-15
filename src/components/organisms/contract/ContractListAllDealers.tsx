import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Space,
  Input,
  Pagination,
  Dropdown,
  Button,
} from "antd";
import { SlidersOutlined } from "@ant-design/icons";
import {
  useContractQueryByEVM,
} from "../../../service/contractService";
import { ContractTable } from "../../molecules/contract/ContractTable";

const { Option } = Select;

export const ContractListAllDealers = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const { data, refetch } = useContractQueryByEVM(
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

  useEffect(() => {
    refetch();
  });

  const contracts = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  const FilterContent = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
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
        >
          <Option value="PENDING">PENDING</Option>
          <Option value="SIGNED">SIGNED</Option>
          <Option value="TERMINATED">TERMINATED</Option>
        </Select>
      </div>

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
          <Option value="asc">ASC</Option>
          <Option value="desc">DESC</Option>
        </Select>
      </div>
    </div>
  );

  return (
    <div>
      <span className="flex justify-between p-5">
        <b className="text-lg text-[#627254]">
          Danh sách hợp đồng bàn giao xe đến toàn bộ Đại lý
        </b>
      </span>

      <Card>
        {/* TOOLBAR */}
        <Space className="flex justify-start pb-5">
          <Input
            placeholder="Tìm kiếm theo mã hợp đồng..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            allowClear
            style={{ width: 350 }}
          />

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
        <ContractTable
          data={contracts}
          page={page}
          size={size}
          total={total}
          onPageChange={(p) => setPage(p - 1)}
        />

        {/* PAGINATION */}
        <div className="p-3 flex justify-center">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={total}
            showSizeChanger
            onChange={(p, s) => {
              setPage(p - 1);
              setSize(s);
            }}
            showTotal={(t) => `Tổng ${t} hợp đồng`}
          />
        </div>
      </Card>
    </div>
  );
};
