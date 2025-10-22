import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IAccount } from "../../../model/Account";
import { AccountStatus, Role } from "../../../model/Account";

// ===== Map vai trò sang tiếng Việt =====
const roleLabels: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý đại lý",
  DEALER_STAFF: "Nhân viên đại lý",
  EVM_STAFF: "Nhân viên EVM",
};

// ===== Màu hiển thị theo vai trò =====
const roleColors: Record<Role, string> = {
  ADMIN: "geekblue",
  MANAGER: "purple",
  DEALER_STAFF: "cyan",
  EVM_STAFF: "orange",
};

interface Props {
  data: IAccount[];
  loading: boolean;
}

export const AccountTable: React.FC<Props> = ({ data, loading }) => {
  const columns: ColumnsType<IAccount> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      align: "center",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      align: "center",
      render: (role: Role) => (
        <Tag
          color={roleColors[role]}
          className="px-3 py-1 rounded-full text-sm"
        >
          {roleLabels[role] ?? role}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status: AccountStatus) => (
        <Tag
          color={status === AccountStatus.ACTIVE ? "green" : "red"}
          className="px-3 py-1 rounded-full text-sm"
        >
          {status === AccountStatus.ACTIVE ? "Hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSize: 8,
          showSizeChanger: false,
          position: ["bottomRight"],
        }}
        bordered
        className="rounded-lg"
        scroll={{ x: 800 }}
      />
    </div>
  );
};
