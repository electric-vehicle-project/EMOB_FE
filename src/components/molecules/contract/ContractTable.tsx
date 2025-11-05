// src/components/molecules/contract/ContractTable.tsx
import { Table, Pagination, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { IContract } from "../../../model/Contract";

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  onChange: (page: number, pageSize?: number) => void;
  showTotal?: (total: number) => string;
}

interface Props {
  data: IContract[];
  pagination?: PaginationProps;
}

export const ContractTable = ({ data, pagination }: Props) => {
  // Sinh bộ lọc theo trạng thái
  const statusFilters = useMemo(
    () =>
      Array.from(new Set((data || []).map((d) => d.status).filter(Boolean))).map(
        (s) => ({ text: String(s), value: String(s) })
      ),
    [data]
  );

  const columns: ColumnsType<IContract> = [
    {
      title: "Mã hợp đồng",
      dataIndex: "contractNumber",
      key: "contractNumber",
      ellipsis: { showTitle: false },
      sorter: (a, b) =>
        (a.contractNumber || "").localeCompare(b.contractNumber || "", "vi", {
          sensitivity: "base",
        }),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: true,
      render: (text: string, record: IContract) => (
        <Tooltip title={text}>
          <Link
            to={`${record.contractId}`}
            className="block truncate text-[#627254] font-semibold hover:underline"
          >
            {text}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center",
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
      render: (val: number) => <span className="font-medium">{val}</span>,
    },
    {
      title: "Tổng giá trị (₫)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0),
      render: (val: number) => (
        <span className="font-semibold text-gray-700">
          {val?.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: statusFilters,
      onFilter: (value, record) => String(record.status) === String(value),
      render: (status: string) => {
        const color =
          status === "SIGNED"
            ? "text-green-600"
            : status === "PENDING"
            ? "text-yellow-600"
            : "text-red-600";
        return (
          <span className={`font-semibold uppercase ${color}`}>{status}</span>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="rounded-2xl overflow-hidden">
        <Table<IContract>
          rowKey="contractId"
          dataSource={data}
          columns={columns}
          bordered
          pagination={false}
          scroll={{ y: 560 }}
          sticky={{ offsetHeader: 0 }}
          className="
            bg-white
            [&_.ant-table-tbody>tr:hover>td]:!bg-white
            [&_.ant-table-row]:!transition-none

            /* Header đồng bộ với DealerTable */
            [&_.ant-table-thead_th.ant-table-column-sort]:!bg-[#627254]
            [&_.ant-table-thead_th.ant-table-column-sort]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-column-sorter]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-column-sorter_.anticon]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-filter-trigger]:!text-white
          "
          rowClassName={() => "bg-white"}
        />
      </div>

      {pagination ? (
        <div className="p-3 flex justify-center">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger={pagination.showSizeChanger}
            onChange={pagination.onChange}
            showTotal={pagination.showTotal}
          />
        </div>
      ) : null}
    </div>
  );
};
