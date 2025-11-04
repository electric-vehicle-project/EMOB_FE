// EMOB-2025 - ReportTable (Giao diện tiếng Việt, đồng bộ PromotionTable)
import { Table, Button, Tag, Tooltip, Space } from "antd";
import { EditOutlined, DeleteOutlined, ToolOutlined } from "@ant-design/icons";
import type { IReport } from "../../../model/Report";

interface Props {
  loading?: boolean;
  data: IReport[];
  pagination?: any;
  onEdit?: (record: IReport) => void;
  onDelete?: (record: IReport) => void;
  onProcess?: (record: IReport) => void;
}

export const ReportTable = ({
  loading,
  data,
  pagination,
  onEdit,
  onDelete,
  onProcess,
}: Props) => {
  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Loại báo cáo",
      dataIndex: "type",
      key: "type",
      render: (v: string) => (
        <Tag
          color={v === "COMPLAINT" ? "red" : "green"}
          className="rounded-full px-3 py-1 text-sm"
        >
          {v === "COMPLAINT" ? "Khiếu nại" : "Phản hồi"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const colorMap: Record<string, string> = {
          PENDING: "orange",
          IN_PROGRESS: "blue",
          RESOLVED: "green",
          DELETED: "red",
        };
        const labelMap: Record<string, string> = {
          PENDING: "Đang chờ",
          IN_PROGRESS: "Đang xử lý",
          RESOLVED: "Đã giải quyết",
          DELETED: "Đã xóa",
        };
        return (
          <Tag color={colorMap[s]} className="rounded-full px-3 py-1 text-sm">
            {labelMap[s] || s}
          </Tag>
        );
      },
    },
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
      render: (t: string) => t || "--",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) =>
        new Date(v).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: IReport) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              className="!text-[#627254] hover:!bg-[#f5f5f5]"
              onClick={() => onEdit?.(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Xử lý">
            <Button
              icon={<ToolOutlined />}
              className="!text-[#627254] hover:!bg-[#f5f5f5]"
              onClick={() => onProcess?.(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              type="text"
              onClick={() => onDelete?.(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      bordered
      rowKey="reportId"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={pagination}
      className="shadow-sm rounded-lg"
      locale={{
        emptyText: "Không có dữ liệu báo cáo",
      }}
    />
  );
};
