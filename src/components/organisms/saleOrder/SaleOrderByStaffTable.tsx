import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SalesByStaffResponse } from "../../../model/SaleOrder";

interface Props {
  data: SalesByStaffResponse[];
  loading?: boolean;

  // ✅ Thêm để đồng bộ hiển thị mũi tên sort và xử lý sort backend
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
  // ✅ Map Ant Design sort direction
  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const columns: ColumnsType<SalesByStaffResponse> = [
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      width: 300,
      ellipsis: true,
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
    },
    {
      title: "Tổng doanh thu (₫)",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: true,
      sortOrder: sortField === "amount" ? order : null,
      render: (value: number) => (
        <span className="text-[#2563eb] font-medium">
          {value?.toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  // ✅ Đồng bộ backend sort handler
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
      className="shadow-sm rounded-lg"
      onChange={handleChange}
    />
  );
};
