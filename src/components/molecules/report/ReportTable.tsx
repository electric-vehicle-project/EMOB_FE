import { Table, Button, Tag, Tooltip, Space } from "antd";
import type {
  ColumnsType,
  TableProps,
  TablePaginationConfig,
} from "antd/es/table";
import { EditOutlined, DeleteOutlined, ToolOutlined } from "@ant-design/icons";
import type { IReport } from "../../../model/Report";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { Link, useLocation } from "react-router-dom";

interface Props {
  loading?: boolean;
  data: IReport[];
  pagination?: TablePaginationConfig;
  onEdit?: (record: IReport) => void;
  onDelete?: (record: IReport) => void;
  onProcess?: (record: IReport) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onChangeSort: (field?: string, order?: "ascend" | "descend") => void;
}

// Header style definition
const headerStyle: React.CSSProperties & Record<string, string> = {
  backgroundColor: "#394e31",
  color: "#fff",
  ["--ant-table-header-sort-active-bg"]: "#394e31",
};

export const ReportTable = ({
  loading,
  data,
  pagination,
  onEdit,
  onDelete,
  onProcess,
  sortField,
  sortDir,
  onChangeSort,
}: Props) => {
  const role = useSelector((state: RootState) => state.user?.role ?? "");
  const location = useLocation();
  const base = location.pathname.replace(/\/$/, "");

  const columns: ColumnsType<IReport> = [
    {
      title: "Tên báo cáo",
      dataIndex: "title",
      key: "title",
      align: "left",
      width: 320,
      sorter: true,
      sortOrder:
        sortField === "title"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (text: string, record) => (
        <Link
          to={`${base}/${record.reportId}`}
          className="hover:underline font-medium"
          style={{ color: "#3b6e58" }}
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
      width: 150,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (v: IReport["type"]) => {
        const map: Record<IReport["type"], { label: string; color: string }> = {
          FEEDBACK: { label: "Phản hồi", color: "green" },
          COMPLAINT: { label: "Khiếu nại", color: "red" },
          DAMAGE: { label: "Hư hỏng", color: "volcano" },
          MAINTENANCE: { label: "Bảo trì", color: "geekblue" },
          PERFORMANCE: { label: "Hiệu suất", color: "purple" },
        };
        const m = map[v];
        return (
          <Tag color={m.color} className="rounded-full px-3 py-1 text-sm">
            {m.label}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 150,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (s: IReport["status"]) => {
        const colorMap: Record<IReport["status"], string> = {
          PENDING: "orange",
          IN_PROGRESS: "blue",
          RESOLVED: "green",
          DELETED: "red",
        };
        const labelMap: Record<IReport["status"], string> = {
          PENDING: "Đang chờ",
          IN_PROGRESS: "Đang xử lý",
          RESOLVED: "Đã giải quyết",
          DELETED: "Đã xóa",
        };
        return (
          <Tag color={colorMap[s]} className="rounded-full px-3 py-1 text-sm">
            {labelMap[s]}
          </Tag>
        );
      },
    },
    {
      title: "Người tạo",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      width: 180,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (t: string) => t || "--",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 190,
      sorter: true,
      sortOrder:
        sortField === "createdAt"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : null,
      onHeaderCell: () => ({ style: headerStyle }),
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
      onHeaderCell: () => ({ style: headerStyle }),
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

  const handleChange: TableProps<IReport>["onChange"] = (_p, _f, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    onChangeSort(
      (s?.field as string) || "createdAt",
      (s?.order as "ascend" | "descend") || undefined
    );
  };

  return (
    <div className="flex flex-col items-center">
      <Table
        bordered
        rowKey="reportId"
        loading={loading}
        columns={columns}
        dataSource={data}
        onChange={handleChange}
        pagination={{
          ...pagination,
          position: ["bottomCenter"],
        }}
        className="shadow-sm rounded-lg w-full"
        locale={{ emptyText: "Không có dữ liệu báo cáo" }}
      />
    </div>
  );
};
