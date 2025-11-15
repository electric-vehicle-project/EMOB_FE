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
import { FilterOutlined } from "@ant-design/icons";
import { useContractQueryByDealer } from "../../../service/contractService";
import { ContractTable } from "../../molecules/contract/ContractTable";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../utils/getCurrentUser";

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

  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

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
            <Option value="PENDING">PENDING</Option>
            <Option value="SIGNED">SIGNED</Option>
            <Option value="TERMINATED">TERMINATED</Option>
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
            <Option value="asc">Tăng dần (ASC)</Option>
            <Option value="desc">Giảm dần (DESC)</Option>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <span className="flex justify-between p-5">
        <b className="text-lg text-[#627254]">
          Danh sách hợp đồng mua bán xe với toàn bộ Khách hàng
        </b>

        <b
          onClick={() =>
            navigate("/" + role.toLowerCase() + "/contract/with-evm")
          }
          className="underline text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
        >
          Danh sách hợp đồng bàn giao với Hãng xe
        </b>
      </span>

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
              icon={<FilterOutlined style={{ fontSize: 20 }} />}
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
