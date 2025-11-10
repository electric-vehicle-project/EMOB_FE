// src/components/organisms/report/ReportTable.tsx
// EMOB-2025 - ReportTable (v3)
// ✅ Click vào tên để xem chi tiết
// ✅ Bỏ cột Nội dung chi tiết, thêm lại Người tạo
// ✅ Tăng width cột Tên báo cáo

import { Table, Button, Tag, Tooltip, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, ToolOutlined } from "@ant-design/icons";
import type { IReport } from "../../../model/Report";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { Link, useLocation } from "react-router-dom";

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
  const role = useSelector((state: RootState) => state.user?.role ?? "");
  const location = useLocation();

  // Xác định base path động (vd: /dealer_staff/report → /dealer_staff/report/:id)
  const base = location.pathname.replace(/\/$/, "");

  const columns: ColumnsType<IReport> = [
    {
      title: "Tên báo cáo",
      dataIndex: "title",
      key: "title",
      align: "left",
      width: 300,
      sorter: (a, b) =>
        a.title.localeCompare(b.title, "vi", { sensitivity: "base" }),
      ellipsis: true,
      render: (text: string, record) => (
        <Link
          to={`${base}/${record.reportId}`}
          className="text-[#3b6e58] hover:underline font-medium"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Loại báo cáo",
      dataIndex: "type",
      key: "type",
      align: "center",
      width: 140,
      filters: [
        { text: "Phản hồi", value: "FEEDBACK" },
        { text: "Khiếu nại", value: "COMPLAINT" },
      ],
      onFilter: (value, record) => record.type === value,
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
      align: "center",
      width: 150,
      filters: [
        { text: "Đang chờ", value: "PENDING" },
        { text: "Đang xử lý", value: "IN_PROGRESS" },
        { text: "Đã giải quyết", value: "RESOLVED" },
        { text: "Đã xóa", value: "DELETED" },
      ],
      onFilter: (value, record) => record.status === value,
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
    // ✅ Thêm lại cột Người tạo
    {
      title: "Người tạo",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      width: 180,
      sorter: (a, b) =>
        a.fullName?.localeCompare(b.fullName ?? "", "vi", {
          sensitivity: "base",
        }) || 0,
      render: (t: string) => t || "--",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 180,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
      align: "center",
      width: 240,
      render: (_, record) => (
        <Space size="small" className="whitespace-nowrap justify-center">
          <Tooltip title="Chỉnh sửa báo cáo">
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={role !== "DEALER_STAFF"}
              onClick={() => onEdit?.(record)}
              className={`text-white ${
                role === "MANAGER"
                  ? "!bg-gray-300 !border-gray-300 cursor-not-allowed"
                  : "!bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52]"
              }`}
              size="middle"
            >
              Sửa
            </Button>
          </Tooltip>

          <Tooltip
            title={
              role !== "MANAGER"
                ? "Chỉ Quản lý mới được xử lý báo cáo"
                : "Xử lý báo cáo"
            }
          >
            <Button
              type="primary"
              icon={<ToolOutlined />}
              disabled={role !== "MANAGER"}
              onClick={() => onProcess?.(record)}
              className={`text-white ${
                role !== "MANAGER"
                  ? "!bg-gray-300 !border-gray-300 cursor-not-allowed"
                  : "!bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52]"
              }`}
              size="middle"
            >
              Xử lý
            </Button>
          </Tooltip>

          <Tooltip title="Xóa báo cáo">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(record)}
              className="!bg-red-500 !border-red-500 text-white hover:!bg-red-600"
              size="middle"
            >
              Xóa
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <Table
        bordered
        rowKey="reportId"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
        className="shadow-sm rounded-lg w-full"
        locale={{
          emptyText: "Không có dữ liệu báo cáo",
        }}
      />
    </div>
  );
};
