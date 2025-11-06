import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Promotion, PromotionStatus } from "../../../model/Promotion";

interface Props {
  data: Promotion[];
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PromotionTable = ({
  data,
  loading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: Props) => {
  const getStatusColor = (status: PromotionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "UPCOMING":
        return "blue";
      case "EXPIRED":
        return "red";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      align: "left",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type) =>
        type ? (
          <Tag color="purple" className="px-2 py-1 rounded-md">
            {type}
          </Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      align: "center",
      render: (val) =>
        val ? <span>{val}%</span> : <span className="text-gray-400">—</span>,
    },
    {
      title: "Thời gian áp dụng",
      key: "time",
      align: "center",
      render: (_, record) => {
        const { startDate, endDate } = record;
        const start = startDate ? dayjs(startDate) : null;
        const end = endDate ? dayjs(endDate) : null;
        if (!start?.isValid() || !end?.isValid())
          return <span className="text-gray-400">—</span>;
        return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: PromotionStatus) =>
        status ? (
          <Tag color={getStatusColor(status)}>{status}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            disabled={!canEdit}
            onClick={() => onEdit?.(record.id)}
            className="!bg-[#627254] !border-[#627254] text-white hover:!bg-[#4f6f52] disabled:!bg-gray-300 disabled:!border-gray-300"
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={!canDelete}
            onClick={() => onDelete?.(record.id)}
            className="!bg-red-500 !border-red-500 text-white hover:!bg-red-600 disabled:!bg-gray-300 disabled:!border-gray-300"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      bordered
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        position: ["bottomCenter"],
        showTotal: (total) => `Tổng cộng ${total} khuyến mãi`,
      }}
      scroll={{ x: "max-content", y: 560 }}
      sticky={{ offsetHeader: 0 }}
      className="
        bg-white
        [&_.ant-table-thead>tr>th]:!bg-[#627254]
        [&_.ant-table-thead>tr>th]:!text-white
        [&_.ant-table-thead>tr>th]:!border-[#627254]
        [&_.ant-table-tbody>tr:hover>td]:!bg-white
      "
    />
  );
};
