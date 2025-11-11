import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { TablePaginationConfig } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Promotion, PromotionStatus } from "../../../model/Promotion";

interface Props {
  data: Promotion[];
  loading?: boolean;
  role: "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onChangeSort: (field?: string, order?: "ascend" | "descend") => void;
  pagination?: TablePaginationConfig;
}

/**
 * Bảng hiển thị danh sách khuyến mãi, hỗ trợ sắp xếp, phân trang và phân quyền thao tác.
 */
export const PromotionTable = ({
  data,
  loading,
  role,
  onEdit,
  onDelete,
  sortField,
  sortDir,
  onChangeSort,
  pagination,
}: Props) => {
  /** Trả về màu tương ứng với trạng thái khuyến mãi */
  const getStatusColor = (status: PromotionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "UPCOMING":
        return "blue";
      case "EXPIRED":
        return "red";
      case "INACTIVE":
        return "volcano";
      default:
        return "default";
    }
  };

  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  /** Quyền sửa khuyến mãi theo vai trò và phạm vi */
  const canEditPromotion = (scope: string): boolean => {
    if (role === "ADMIN" || role === "EVM_STAFF") return true;
    if (role === "MANAGER" || role === "DEALER_STAFF") return scope === "LOCAL";
    return false;
  };

  /** Quyền xóa khuyến mãi theo vai trò (chỉ ADMIN được phép) */
  const canDeletePromotion = (): boolean => {
    return role === "ADMIN";
  };

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: sortField === "name" ? order : null,
      align: "left",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type?: string) =>
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
      sorter: true,
      sortOrder: sortField === "value" ? order : null,
      render: (val?: number) =>
        typeof val === "number" ? (
          <span>{val}%</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Thời gian áp dụng",
      dataIndex: "startDate",
      key: "startDate",
      align: "center",
      sorter: true,
      sortOrder: sortField === "startDate" ? order : null,
      render: (_, record) => {
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);
        if (!start.isValid() || !end.isValid()) {
          return <span className="text-gray-400">—</span>;
        }
        return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
      },
    },
    {
      title: "Phạm vi",
      dataIndex: "scope",
      key: "scope",
      align: "center",
      render: (scope: string) => (
        <Tag color={scope === "GLOBAL" ? "geekblue" : "success"}>{scope}</Tag>
      ),
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
      render: (_, record) => {
        const editDisabled = !canEditPromotion(record.scope);
        const deleteDisabled = !canDeletePromotion();

        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={editDisabled}
              onClick={() => onEdit?.(record.id)}
              className={`!border-none ${
                editDisabled
                  ? "!bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "!bg-[#627254] text-white hover:!bg-[#4f6f52]"
              }`}
            >
              Sửa
            </Button>

            <Button
              icon={<DeleteOutlined />}
              disabled={deleteDisabled}
              onClick={() => onDelete?.(record.id)}
              className={`!border-none ${
                deleteDisabled
                  ? "!bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "!bg-[#d93025] text-white hover:!bg-[#b1271e]"
              }`}
            >
              Xoá
            </Button>
          </Space>
        );
      },
    },
  ];

  /** Xử lý thay đổi sắp xếp trên bảng */
  const handleChange: TableProps<Promotion>["onChange"] = (_p, _f, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    onChangeSort?.(s?.field as string, s?.order as "ascend" | "descend");
  };

  return (
    <Table
      bordered
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={data}
      loading={loading}
      onChange={handleChange}
      pagination={pagination}
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
