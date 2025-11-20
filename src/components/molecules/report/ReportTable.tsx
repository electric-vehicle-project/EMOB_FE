// src/components/molecules/report/ReportTable.tsx
import { Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { IReport } from "../../../model/Report";
import { EMOBTable } from "../../molecules/EMOBTable";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { JSX } from "react";

interface ReportTableProps {
  data: IReport[];
  loading?: boolean;
  pagination?: TablePaginationConfig;

  sortField?: keyof IReport;
  sortDir?: "asc" | "desc";
  onSortChange?: (field: keyof IReport, order: "asc" | "desc") => void;

  onEdit?: (record: IReport) => void;
  onProcess?: (record: IReport) => void;
  onDelete?: (record: IReport) => void;
  onViewDetail?: (id: string) => void;
}

export const ReportTable = ({
  data,
  loading,
  pagination,
  onEdit,
  onProcess,
  onDelete,
  onViewDetail,
}: ReportTableProps) => {
  const role = useSelector((s: RootState) => s.user?.role ?? "");

  /** ==== Columns ==== */
  const columns: ColumnsType<IReport> = [
    {
      title: "Tên báo cáo",
      dataIndex: "title",
      key: "title",
      width: 260,
      ellipsis: true,
      render: (text: string, record) => (
        <span
          className="text-black font-medium hover:underline cursor-pointer"
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
        return item ? (
          <Tag color={item.color}>{item.label}</Tag>
        ) : (
          <Tag>{type || "Không xác định"}</Tag>
        );
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
        return item ? (
          <Tag color={item.color}>{item.label}</Tag>
        ) : (
          <Tag>{status || "Không xác định"}</Tag>
        );
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

  /** ==== Actions ==== */
  const actions = (record: IReport) => {
    const items: { key: string; label: JSX.Element }[] = [];

    items.push({
      key: "view",
      label: (
        <div
          className="text-black cursor-pointer hover:text-[#4f6f52]"
          onClick={() => onViewDetail?.(record.reportId)}
        >
          Chi tiết
        </div>
      ),
    });

    if (role === "DEALER_STAFF") {
      items.push({
        key: "edit",
        label: (
          <div
            className="text-black cursor-pointer hover:text-[#4f6f52]"
            onClick={() => onEdit?.(record)}
          >
            Chỉnh sửa
          </div>
        ),
      });
    }

    if (role === "MANAGER") {
      items.push({
        key: "process",
        label: (
          <div
            className="text-black cursor-pointer hover:text-[#4f6f52]"
            onClick={() => onProcess?.(record)}
          >
            Xử lý
          </div>
        ),
      });
    }

    items.push({
      key: "delete",
      label: (
        <div
          className="text-red-600 cursor-pointer hover:text-red-700"
          onClick={() => onDelete?.(record)}
        >
          Xóa
        </div>
      ),
    });

    return items;
  };

  /** ==== Table (không còn sort) ==== */
  return (
    <EMOBTable<IReport>
      rowKey="reportId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      actions={actions}
    />
  );
};

export default ReportTable;
