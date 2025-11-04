// EMOB-2025 - ReportTable (UI synced)
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
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (v: string) => (
        <Tag
          color={v === "COMPLAINT" ? "red" : "green"}
          className="rounded-full px-3 py-1"
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const colorMap: Record<string, string> = {
          PENDING: "orange",
          IN_PROGRESS: "blue",
          RESOLVED: "green",
          DELETED: "red",
        };
        return (
          <Tag color={colorMap[s]} className="rounded-full px-3 py-1">
            {s}
          </Tag>
        );
      },
    },
    {
      title: "Customer",
      dataIndex: "fullName",
      key: "fullName",
      render: (t: string) => t || "--",
    },
    {
      title: "Created At",
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
      title: "Actions",
      key: "actions",
      render: (_: any, record: IReport) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              className="!text-[#627254] hover:!bg-[#f5f5f5]"
              onClick={() => onEdit?.(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Process">
            <Button
              icon={<ToolOutlined />}
              className="!text-[#627254] hover:!bg-[#f5f5f5]"
              onClick={() => onProcess?.(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Delete">
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
    />
  );
};
