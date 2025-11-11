import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SalesByStaffResponse } from "../../../model/SaleOrder";

interface Props {
  data: SalesByStaffResponse[];
  loading?: boolean;
  onSortChange?: (
    field: keyof SalesByStaffResponse,
    order: "asc" | "desc"
  ) => void;
}

export const SaleOrderByStaffTable: React.FC<Props> = ({
  data,
  loading = false,
  onSortChange,
}) => {
  const columns: ColumnsType<SalesByStaffResponse> = [
    {
      title: "Nhân viên",
      dataIndex: "accountId",
      key: "accountId",
      width: 300,
      ellipsis: true,
      render: (_, record) => (
        <span className="font-medium text-gray-700">{record.accountId}</span>
      ),
    },
    {
      title: "Số lượng đơn hàng",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center",
      sorter: true,
    },
    {
      title: "Tổng doanh thu (₫)",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: true,
      render: (value: number) => (
        <span className="text-[#2563eb] font-medium">
          {value?.toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  // Fix type sorter bằng TableProps
  const handleChange: TableProps<SalesByStaffResponse>["onChange"] = (
    _pagination,
    _filters,
    sorter
  ) => {
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    if (
      onSortChange &&
      singleSorter?.field &&
      typeof singleSorter.field === "string" &&
      singleSorter.order
    ) {
      const order = singleSorter.order === "ascend" ? "asc" : "desc";
      onSortChange(singleSorter.field as keyof SalesByStaffResponse, order);
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
