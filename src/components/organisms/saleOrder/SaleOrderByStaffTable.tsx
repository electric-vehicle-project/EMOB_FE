import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
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

export const SaleOrderByStaffTable: React.FC<Props> = ({
  data,
  loading = false,
  sortField,
  sortDir = "desc",
  onSortChange,
}) => {
  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#394e31",
    color: "white",
    textAlign: "center",
  };

  const columns: ColumnsType<SalesByStaffResponse> = [
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      align: "left",
      ellipsis: true,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (text: string) => (
        <span className="font-medium text-gray-700">{text}</span>
      ),
    },
    {
      title: "Số lượng đơn hàng",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center",
      sorter: true,
      sortOrder: sortField === "orderCount" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (value: number) => (
        <span className="text-gray-800 font-semibold">{value}</span>
      ),
    },
    {
      title: "Tổng doanh thu (₫)",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: true,
      sortOrder: sortField === "amount" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (value: number) => (
        <span className="text-[#2563eb] font-semibold whitespace-nowrap">
          {value != null ? value.toLocaleString("vi-VN") : "0"}
        </span>
      ),
    },
  ];

  const handleChange: TableProps<SalesByStaffResponse>["onChange"] = (
    _pagination,
    _filters,
    sorter
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (onSortChange && s?.field && typeof s.field === "string" && s.order) {
      const order = s.order === "ascend" ? "asc" : "desc";
      onSortChange(s.field as keyof SalesByStaffResponse, order);
    }
  };

  return (
    <Table
      rowKey="accountId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      bordered={false}
      className="rounded-lg shadow-sm bg-white [&_.ant-table-thead>tr>th]:!text-white"
      onChange={handleChange}
      scroll={{ x: "max-content" }}
    />
  );
};
