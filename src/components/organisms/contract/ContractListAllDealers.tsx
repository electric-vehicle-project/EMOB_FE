import { useState } from "react";
import { Card, Select, Space, Input } from "antd";
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

  const { data } = useContractQueryByEVM({}, {
    page,
    size,
    sortField,
    sortDir,
    statuses,
    keyword,
  });
  const contracts = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  return (
    <div>
      <span>Danh sách hợp đồng bàn giao xe đến toàn bộ Đại lý</span>
      <Card
        extra={
          <Space className="overflow-x-hidden">
            <Input
              placeholder="Tìm kiếm theo mã hợp đồng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              style={{ width: 450 }}
            />

            <Select
              placeholder="Trạng thái"
              mode="multiple"
              value={statuses}
              onChange={setStatuses}
              style={{ width: 180 }}
              allowClear
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="SIGNED">SIGNED</Option>
              <Option value="TERMINATED">TERMINATED</Option>
            </Select>

            <Select
              value={sortField}
              onChange={(v) => setSortField(v)}
              style={{ width: 150 }}
            >
              <Option value="createdAt">Ngày tạo</Option>
              <Option value="updatedAt">Ngày cập nhật</Option>
              <Option value="purchaseDate">Ngày ký kết</Option>
            </Select>

            <Select
              value={sortDir}
              onChange={(v) => setSortDir(v)}
              style={{ width: 100 }}
            >
              <Option value="asc">ASC</Option>
              <Option value="desc">DESC</Option>
            </Select>

            <Select
              value={size}
              onChange={(v) => setSize(v)}
              style={{ width: 120 }}
            >
              <Option value={10}>10 / page</Option>
              <Option value={20}>20 / page</Option>
              <Option value={50}>50 / page</Option>
              <Option value={100}>100 / page</Option>
            </Select>
          </Space>
        }
      >
        <ContractTable
          data={contracts}
          pagination={{
            current: page + 1,
            pageSize: size,
            total,
            showSizeChanger: false,
            onChange: (newPage) => setPage(newPage - 1),
            showTotal: (t) => `Tổng ${t} hợp đồng`,
          }}
        />
      </Card>
    </div>
  );
};
