import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig } from "antd";
import dayjs from "dayjs";

import type {
  ICustomer,
  CustomerStatus,
  MembershipLevel,
} from "../../../model/Customer";

import { EMOBTable } from "../../molecules/EMOBTable";

interface Props {
  data: ICustomer[];
  loading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDetail?: (id: string) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onChangeSort: (field?: string, order?: "ascend" | "descend") => void;
  pagination?: TablePaginationConfig;
}

const STATUS_COLORS: Record<CustomerStatus, string> = {
  LEAD: "blue",
  ACTIVE: "green",
  INACTIVE: "orange",
  BLOCKED: "volcano",
  DELETED: "red",
};

const STATUS_LABELS: Record<CustomerStatus, string> = {
  LEAD: "Tiềm năng",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BLOCKED: "Bị chặn",
  DELETED: "Đã xoá",
};

const MEMBERSHIP_LABELS: Record<MembershipLevel, string> = {
  NORMAL: "Thường",
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch kim",
};

export const CustomerTable = ({
  data,
  loading,
  onEdit,
  onDelete,
  onDetail,
  pagination,
}: Props) => {
  const columns: ColumnsType<ICustomer> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: false,
      render: (text, record) => (
        <div
          className="text-[#4f6f52] hover:text-[#627254] font-medium cursor-pointer"
          onClick={() => onDetail?.(record.id)}
        >
          {text || "Không xác định"}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: false,
      render: (email?: string) => email || "—",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: false,
      render: (phone?: string) => phone || "—",
    },
    {
      title: "Cấp độ",
      dataIndex: "memberShipLevel",
      key: "memberShipLevel",
      align: "center",
      sorter: false,
      render: (level?: MembershipLevel) =>
        level ? <Tag color="geekblue">{MEMBERSHIP_LABELS[level]}</Tag> : "—",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      sorter: false,
      align: "center",
      render: (val?: string) => (val ? dayjs(val).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      sorter: false,
      render: (status?: CustomerStatus) =>
        status ? (
          <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <EMOBTable<ICustomer>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      actions={(record) => [
        {
          key: "detail",
          label: (
            <div
              className="cursor-pointer"
              onClick={() => onDetail?.(record.id)}
            >
              Chi tiết
            </div>
          ),
        },
        {
          key: "edit",
          label: (
            <div className="cursor-pointer" onClick={() => onEdit?.(record.id)}>
              Chỉnh sửa
            </div>
          ),
        },
        {
          key: "delete",
          label: (
            <div
              className="text-red-600 cursor-pointer"
              onClick={() => onDelete?.(record.id)}
            >
              Xoá
            </div>
          ),
        },
      ]}
    />
  );
};
