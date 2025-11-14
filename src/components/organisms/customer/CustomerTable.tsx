import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { TablePaginationConfig } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import dayjs from "dayjs";
import type { ICustomer } from "../../../model/Customer";

interface Props {
  data: ICustomer[];
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;

  // --- Server sort
  sortField: string;
  sortDir: "asc" | "desc";
  onChangeSort: (field?: string, order?: "ascend" | "descend") => void;

  // --- Server pagination (pass through)
  pagination?: TablePaginationConfig;
}

const headerStyle: React.CSSProperties = {
  backgroundColor: "#394e31",
  color: "#fff",
  ["--ant-table-header-sort-active-bg" as unknown as string]: "#394e31",
};

export const CustomerTable = ({
  data,
  loading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  sortField,
  sortDir,
  onChangeSort,
  pagination,
}: Props) => {
  const user = useSelector((s: RootState) => s.user);
  const role = (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";
  const rolePrefix = role === "MANAGER" ? "/manager" : "/dealer_staff";

  const getStatusColor = (status: ICustomer["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "LEAD":
        return "blue";
      case "INACTIVE":
        return "orange";
      case "BLOCKED":
        return "volcano";
      case "DELETED":
        return "red";
      default:
        return "default";
    }
  };

  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const columns: ColumnsType<ICustomer> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: true,
      sortOrder: sortField === "fullName" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (text: string, record: ICustomer) => (
        <a
          onClick={() =>
            window.open(`${rolePrefix}/customers/${record.id}`, "_self")
          }
          className="text-[#4f6f52] hover:text-[#627254] font-medium transition-colors cursor-pointer"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: sortField === "email" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
      sortOrder: sortField === "phoneNumber" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
    },
    {
      title: "Cấp độ",
      dataIndex: "memberShipLevel",
      key: "memberShipLevel",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (level: string) => <Tag color="geekblue">{level}</Tag>,
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      align: "center",
      sorter: true,
      sortOrder: sortField === "dateOfBirth" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (val?: string) => (val ? dayjs(val).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (status: ICustomer["status"]) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record.id)}
            disabled={!canEdit}
            className={`!border-none ${
              canEdit
                ? "!bg-[#627254] text-white hover:!bg-[#4f6f52]"
                : "!bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Sửa
          </Button>

          <Button
            icon={<DeleteOutlined />}
            onClick={() => onDelete?.(record.id)}
            disabled={!canDelete}
            className={`!border-none ${
              canDelete
                ? "!bg-[#d93025] text-white hover:!bg-[#b1271e]"
                : "!bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  const handleChange: TableProps<ICustomer>["onChange"] = (_p, _f, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = s?.field as string | undefined;
    const order = s?.order as "ascend" | "descend" | undefined;
    onChangeSort?.(field, order);
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
        [&_.ant-table-thead>tr>th]:!text-white
      "
    />
  );
};
