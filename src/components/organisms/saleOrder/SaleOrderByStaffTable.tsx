import { EMOBTable } from "../../molecules/EMOBTable";
import type { ColumnsType } from "antd/es/table";
import type {
  TablePaginationConfig,
  SorterResult,
} from "antd/es/table/interface";
import type { SalesByStaffResponse } from "../../../model/SaleOrder";

interface Props {
  data: SalesByStaffResponse[];
  loading?: boolean;
  sortField?: keyof SalesByStaffResponse;
  sortDir?: "asc" | "desc";
  onSortChange?: (
    field: keyof SalesByStaffResponse,
    order: "asc" | "desc"
  ) => void;
}

export const SaleOrderByStaffTable = ({
  data,
  loading = false,
  sortField,
  sortDir = "desc",
  onSortChange,
}: Props) => {
  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const columns: ColumnsType<SalesByStaffResponse> = [
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <span className="font-medium text-gray-700">{text}</span>
      ),
    },
    {
      title: "Số lượng đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center",
      sorter: true,
      sortOrder: sortField === "orderCount" ? order : null,
      render: (value: number) => (
        <span className="text-gray-900 font-semibold">{value}</span>
      ),
    },
    {
      title: "Tổng doanh thu (₫)",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: true,
      sortOrder: sortField === "amount" ? order : null,
      render: (value: number) => (
        <span className="text-[#2563eb] font-semibold whitespace-nowrap">
          {value?.toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  const handleChange = (
    _p: TablePaginationConfig,
    _f: Record<string, unknown>,
    sorter:
      | SorterResult<SalesByStaffResponse>
      | SorterResult<SalesByStaffResponse>[]
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    if (s?.field && s.order) {
      const field = s.field as keyof SalesByStaffResponse;
      const direction = s.order === "ascend" ? "asc" : "desc";
      onSortChange?.(field, direction);
    }
  };

  return (
    <EMOBTable<SalesByStaffResponse>
      rowKey="accountId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      onChange={handleChange}
    />
  );
};
