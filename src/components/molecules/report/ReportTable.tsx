import { Tag, Button } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import type { IReport } from "../../../model/Report";
import type { FilterValue } from "antd/es/table/interface";
import { EMOBTable } from "../../molecules/EMOBTable";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import {
  EyeOutlined,
  EditOutlined,
  ToolOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

interface ReportTableProps {
  data: IReport[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  sortField?: keyof IReport;
  sortDir?: "asc" | "desc";
  onSortChange?: (field: keyof IReport, order: "asc" | "desc") => void;

  /** Actions */
  onEdit?: (record: IReport) => void;
  onProcess?: (record: IReport) => void;
  onDelete?: (record: IReport) => void;
  onViewDetail?: (id: string) => void;
}

export const ReportTable = ({
  data,
  loading,
  pagination,
  sortField = "createdAt",
  sortDir = "desc",
  onSortChange,
  onEdit,
  onProcess,
  onDelete,
  onViewDetail,
}: ReportTableProps) => {
  const role = useSelector((s: RootState) => s.user?.role ?? "");

  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  /** ==== Columns ==== */
  const columns: ColumnsType<IReport> = [
    {
      title: "Tên báo cáo",
      dataIndex: "title",
      key: "title",
      width: 260,
      ellipsis: true,
      sorter: true,
      sortOrder: sortField === "title" ? order : null,
      render: (text: string, record) => (
        <span
          className="text-[#3b6e58] font-medium hover:underline cursor-pointer"
          onClick={() => onViewDetail?.(record.reportId)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 150,
      align: "center",
      render: (type: IReport["type"]) => {
        const map = {
          FEEDBACK: { color: "green", label: "Phản hồi" },
          COMPLAINT: { color: "red", label: "Khiếu nại" },
          DAMAGE: { color: "volcano", label: "Hư hỏng" },
          MAINTENANCE: { color: "geekblue", label: "Bảo trì" },
          PERFORMANCE: { color: "purple", label: "Hiệu suất" },
        } as const;

        const item = map[type];
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (status: IReport["status"]) => {
        const map = {
          PENDING: { color: "orange", label: "Đang chờ" },
          IN_PROGRESS: { color: "blue", label: "Đang xử lý" },
          RESOLVED: { color: "green", label: "Đã giải quyết" },
          DELETED: { color: "red", label: "Đã xóa" },
        } as const;

        const item = map[status];
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "Người tạo",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      align: "center",
      render: (value: string) => value || "--",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      align: "center",
      sorter: true,
      sortOrder: sortField === "createdAt" ? order : null,
      render: (v: string) =>
        new Date(v).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  /** ==== Actions in Dropdown ==== */
  const actions = (record: IReport) => {
    const items = [
      {
        key: "view",
        label: (
          <Button
            type="link"
            icon={<EyeOutlined />}
            className="!text-[#627254]"
            onClick={() => onViewDetail?.(record.reportId)}
          >
            Xem chi tiết
          </Button>
        ),
      },
    ];

    if (role === "DEALER_STAFF") {
      items.push({
        key: "edit",
        label: (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
            className="!text-[#627254]"
          >
            Chỉnh sửa
          </Button>
        ),
      });
    }

    if (role === "MANAGER") {
      items.push({
        key: "process",
        label: (
          <Button
            type="link"
            icon={<ToolOutlined />}
            onClick={() => onProcess?.(record)}
            className="!text-[#627254]"
          >
            Xử lý
          </Button>
        ),
      });
    }

    items.push({
      key: "delete",
      label: (
        <Button
          type="link"
          icon={<DeleteOutlined />}
          onClick={() => onDelete?.(record)}
          className="!text-red-600"
        >
          Xóa
        </Button>
      ),
    });

    return items;
  };

  /** ==== Sort handler ==== */
  const handleChange: TableProps<IReport>["onChange"] = (
    _pagination,
    _filters: Record<string, FilterValue | null>,
    sorter
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s || !s.field) return;

    const field = s.field as keyof IReport;
    const order = s.order === "ascend" ? "asc" : "desc";

    onSortChange?.(field, order);
  };

  return (
    <EMOBTable<IReport>
      rowKey="reportId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      actions={actions}
      onChange={handleChange}
    />
  );
};

export default ReportTable;
