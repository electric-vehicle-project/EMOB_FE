import { EMOBTable } from "../../molecules/EMOBTable";
import type { ColumnsType } from "antd/es/table";
import type { SalesByStaffResponse } from "../../../model/SaleOrder";

interface Props {
  data: SalesByStaffResponse[];
  loading?: boolean;
  sortField: keyof SalesByStaffResponse;
  sortDir: "asc" | "desc";
  onSortChange: (
    field: keyof SalesByStaffResponse,
    order: "asc" | "desc"
  ) => void;
}

export const SaleOrderByStaffTable = ({
  data,
  loading = false,
  sortField,
  sortDir,
  onSortChange,
}: Props) => {
  const columns: ColumnsType<SalesByStaffResponse> = [
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
      // ⚠ KHÔNG THÊM SORT Ở ĐÂY – staffName không thuộc BE
    },
    {
      title: "Số lượng đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center",
      sorter: true,
      sortOrder:
        sortField === "orderCount"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : null,
      onHeaderCell: () => ({
        onClick: () =>
          onSortChange(
            "orderCount",
            sortField === "orderCount" && sortDir === "asc" ? "desc" : "asc"
          ),
      }),
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      title: "Tổng doanh thu (₫)",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: true,
      sortOrder:
        sortField === "amount"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : null,
      onHeaderCell: () => ({
        onClick: () =>
          onSortChange(
            "amount",
            sortField === "amount" && sortDir === "asc" ? "desc" : "asc"
          ),
      }),
      render: (value: number) => (
        <span className="font-semibold text-[#2563eb] whitespace-nowrap">
          {value?.toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <EMOBTable<SalesByStaffResponse>
      rowKey="accountId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
    />
  );
};
