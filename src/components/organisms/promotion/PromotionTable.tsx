import { Table, Tag, Button, Popconfirm, Tooltip, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Promotion, PromotionStatus } from "../../../model/Promotion";

interface Props {
  data: Promotion[];
  loading?: boolean;
  canEdit?: boolean; // quyền chỉnh sửa
  canDelete?: boolean; // quyền xoá
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * PromotionTable (UI đồng bộ)
 * - Bỏ cột phạm vi
 * - Căn giữa dấu “—”
 * - Ngày invalid hiển thị “—”
 * - Luôn hiển thị nút Sửa/Xoá, nhưng .disabled nếu không có quyền
 */
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
      case "INACTIVE":
        return "default";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Loại khuyến mãi",
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
        typeof val === "number" ? (
          <span className="font-medium">{val}%</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Thời gian áp dụng",
      key: "time",
      align: "center",
      render: (_, record) => {
        const { startDate, endDate } = record;
        const start = startDate ? dayjs(startDate) : null;
        const end = endDate ? dayjs(endDate) : null;
        if (!start?.isValid() || !end?.isValid()) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <span>
            {start.format("DD/MM/YYYY")} - {end.format("DD/MM/YYYY")}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: PromotionStatus) =>
        status ? (
          <Tag color={getStatusColor(status)} className="px-3 py-1 rounded-md">
            {status}
          </Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          {/* Luôn hiển thị, nhưng disable khi không có quyền */}
          <Tooltip title={canEdit ? "Chỉnh sửa" : "Bạn không có quyền sửa"}>
            <Button
              icon={<EditOutlined />}
              type="link"
              onClick={() => onEdit?.(record.id)}
              disabled={!canEdit}
            />
          </Tooltip>

          <Popconfirm
            title={canDelete ? "Xóa khuyến mãi này?" : "Bạn không có quyền xoá"}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete?.(record.id)}
            disabled={!canDelete}
          >
            <Tooltip title={canDelete ? "Xóa" : "Bạn không có quyền xoá"}>
              <Button
                danger
                type="link"
                icon={<DeleteOutlined />}
                disabled={!canDelete}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      rowKey="id"
      bordered
      size="middle"
      className="rounded-xl shadow-sm overflow-hidden"
    />
  );
};

export default PromotionTable;
