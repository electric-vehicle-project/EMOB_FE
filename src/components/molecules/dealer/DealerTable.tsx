// src/components/molecules/dealer/DealerTable.tsx
import { Table, Button, Pagination, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import type { IDealer } from "../../../model/Dealer";

const { Paragraph } = Typography;

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  onChange: (page: number, pageSize?: number) => void;
  showTotal?: (total: number) => string;
}

interface Props {
  data: IDealer[];
  onEdit: (dealer: IDealer) => void;
  onDelete: (id: string) => void;
  canModify?: boolean;
  pagination?: PaginationProps; // phân trang giống Account
}

export const DealerTable = ({
  data,
  onEdit,
  onDelete,
  canModify = false,
  pagination,
}: Props) => {
  // Filter cho Quốc gia (tự sinh từ data)
  const countryFilters = useMemo(
    () =>
      Array.from(
        new Set((data || []).map((d) => d.country).filter(Boolean))
      ).map((c) => ({ text: String(c), value: String(c) })),
    [data]
  );

  const columns: ColumnsType<IDealer> = [
    {
      title: "Tên đại lý",
      dataIndex: "name",
      key: "name",
      ellipsis: { showTitle: false },
      sorter: (a, b) =>
        (a.name || "").localeCompare(b.name || "", "vi", {
          sensitivity: "base",
        }),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="block truncate">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Thông tin liên hệ",
      dataIndex: "contactInfo",
      key: "contactInfo",
      ellipsis: { showTitle: false },
      render: (val: string) => (
        <Tooltip title={val}>
          <span className="block truncate font-medium">{val}</span>
        </Tooltip>
      ),
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
      ellipsis: { showTitle: false },
      filters: countryFilters,
      onFilter: (value, record) => String(record.country) === String(value),
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="block truncate">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      // Dùng 2 dòng để đỡ đội chiều cao, vẫn hover xem full
      render: (addr: string) => (
        <Tooltip title={addr}>
          <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
            {addr}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (val: string) =>
        val ? new Date(val).toLocaleString("vi-VN") : "-",
      sorter: (a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      },
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: true,
    },
  ];

  if (canModify) {
    columns.push({
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="!bg-[#627254] hover:!bg-[#525e46] text-white rounded-md"
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id!)}
            className="rounded-md"
          >
            Xóa
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Clip bo góc để header sticky không lòi viền */}
      <div className="rounded-2xl overflow-hidden">
        <Table<IDealer>
          rowKey="id"
          dataSource={data}
          columns={columns}
          bordered
          pagination={false} // dùng footer Pagination
          // Cuộn dọc + header sticky (giống Account)
          scroll={{ y: 560 }}
          sticky={{ offsetHeader: 0 }}
          className="
            bg-white
            [&_.ant-table-tbody>tr:hover>td]:!bg-white
            [&_.ant-table-row]:!transition-none

            /* Chỉ khi cột đang sort: nền xanh + chữ/icon trắng (đồng bộ Account) */
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
