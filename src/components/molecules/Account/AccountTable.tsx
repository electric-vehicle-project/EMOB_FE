// src/components/molecules/Account/AccountTable.tsx
import {
  Table,
  Tag,
  Tooltip,
  Typography,
  Pagination,
  Dropdown,
  Menu,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EllipsisOutlined } from "@ant-design/icons";

import {
  AccountStatus as AccountStatusConst,
  Role as RoleConst,
  type IAccount,
  type AccountStatus as AccountStatusType,
  type Role as RoleType,
} from "../../../model/Account";

const { Link } = Typography;

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  onChange: (page: number, pageSize?: number) => void;
  showTotal?: (total: number) => string;
}

interface Props {
  data: IAccount[];
  loading?: boolean;
  canModify?: boolean;
  onChangeStatus: (id: string, next: "ACTIVE" | "INACTIVE") => void;
  onBan: (id: string) => void;
  pagination?: PaginationProps;
  dealerMap?: Record<string, string>;
  currentUserRole?: RoleType;
  onViewDetails?: (account: IAccount) => void;
}

const ROLE_LABEL: Record<RoleType, string> = {
  [RoleConst.ADMIN]: "Quản trị viên",
  [RoleConst.MANAGER]: "Quản lý đại lý",
  [RoleConst.DEALER_STAFF]: "Nhân viên đại lý",
  [RoleConst.EVM_STAFF]: "Nhân viên EVM",
};

const ROLE_COLOR: Record<RoleType, string> = {
  [RoleConst.ADMIN]: "blue",
  [RoleConst.MANAGER]: "purple",
  [RoleConst.DEALER_STAFF]: "cyan",
  [RoleConst.EVM_STAFF]: "blue",
};

const STATUS_LABEL: Record<AccountStatusType, string> = {
  [AccountStatusConst.ACTIVE]: "Hoạt động",
  [AccountStatusConst.INACTIVE]: "Ngừng hoạt động",
  [AccountStatusConst.BANNED]: "Đã cấm",
};

const STATUS_COLOR: Record<AccountStatusType, string> = {
  [AccountStatusConst.ACTIVE]: "green",
  [AccountStatusConst.INACTIVE]: "orange",
  [AccountStatusConst.BANNED]: "red",
};

export const AccountTable: React.FC<Props> = ({
  data,
  loading,
  canModify = false,
  onChangeStatus,
  onBan,
  pagination,
  dealerMap = {},
  currentUserRole,
  onViewDetails,
}) => {
  const isAdmin = currentUserRole === RoleConst.ADMIN;
  const isManager = currentUserRole === RoleConst.MANAGER;

  const columns: ColumnsType<IAccount> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      render: (text: string, record) => (
        <Tooltip title={text}>
          <Link
            onClick={() => onViewDetails && onViewDetails(record)}
            className="font-medium"
          >
            {text}
          </Link>
        </Tooltip>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      render: (email) => email || "-",
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },

    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (_, record) => {
        const dealerName =
          record.dealerId && dealerMap[record.dealerId]
            ? dealerMap[record.dealerId]
            : "";

        const role = record.role;
        const isManaged = role !== RoleConst.ADMIN && dealerName;

        return (
          <div className="flex flex-col items-center gap-1">
            <Tag color={ROLE_COLOR[role]} className="m-0">
              {ROLE_LABEL[role]}
            </Tag>

            {isAdmin && isManaged ? (
              <span className="text-xs text-gray-700">
                của đại lý: {dealerName}
              </span>
            ) : null}

            {isManager && role === RoleConst.DEALER_STAFF && dealerName ? (
              <span className="text-xs text-gray-700">
                của đại lý: {dealerName}
              </span>
            ) : null}
          </div>
        );
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: AccountStatusType) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
      ),
    },
  ];

  /* ======================= ACTION MENU ======================= */
  if (canModify) {
    columns.push({
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 80,
      render: (_, record) => {
        if (record.status === AccountStatusConst.BANNED) {
          return <Tag color="red">Đã cấm vĩnh viễn</Tag>;
        }

        const isInactive = record.status === AccountStatusConst.INACTIVE;
        const next = isInactive ? "ACTIVE" : "INACTIVE";

        const menuItems = [
          {
            key: "toggle",
            label: (
              <span className="text-[14px] pl-10 pr-10">
                {isInactive ? "Mở lại" : "Tạm ngưng"}
              </span>
            ),
            onClick: () => onChangeStatus(record.id, next),
          },
          {
            key: "ban",
            label: (
              <span className="text-[14px] pl-10 pr-10 text-red-500">
                Cấm vĩnh viễn
              </span>
            ),
            onClick: () => onBan(record.id),
          },
        ];

        const menu = <Menu items={menuItems} />;

        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <EllipsisOutlined className="text-2xl cursor-pointer text-gray-600 hover:text-black" />
          </Dropdown>
        );
      },
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <Table<IAccount>
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      {pagination && (
        <div className="p-3 flex justify-center">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};
