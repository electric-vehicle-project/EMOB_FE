import { Table, Tag, Tooltip, Typography, Pagination, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IAccount } from "../../../model/Account";
import { AccountStatus, Role } from "../../../model/Account";

const { Link, Paragraph } = Typography;

interface Props {
  data: IAccount[];
  loading: boolean;
  canModify: boolean;
  onChangeStatus: (id: string, next: "ACTIVE" | "INACTIVE") => void;
  onBan: (id: string) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger: boolean;
    onChange: (page: number, pageSize?: number) => void;
    showTotal?: (total: number) => string;
  };
  dealerMap?: Record<string, string>;
  currentUserRole?: Role;
  onViewDetails?: (account: IAccount) => void;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý đại lý",
  DEALER_STAFF: "Nhân viên đại lý",
  EVM_STAFF: "Nhân viên EVM",
};

const ROLE_COLOR: Record<Role, string> = {
  ADMIN: "blue",
  MANAGER: "purple",
  DEALER_STAFF: "cyan",
  EVM_STAFF: "blue",
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BANNED: "Đã cấm",
};

const STATUS_COLOR: Record<AccountStatus, string> = {
  ACTIVE: "green",
  INACTIVE: "orange",
  BANNED: "red",
};

const TABLE_SCROLL_Y = 560;

export const AccountTable: React.FC<Props> = ({
  data,
  loading,
  canModify,
  onChangeStatus,
  onBan,
  pagination,
  dealerMap = {},
  currentUserRole,
  onViewDetails,
}) => {
  const isAdminTable = currentUserRole === Role.ADMIN;

  // Các cột thông tin chính, không sort, không width cố định
  const baseColumns: ColumnsType<IAccount> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      align: "center",
      ellipsis: { showTitle: false },
      render: (text: string, record) => (
        <Tooltip title={text}>
          <Link
            onClick={() => onViewDetails && onViewDetails(record)}
            className="block truncate font-medium"
          >
            {text}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      ellipsis: { showTitle: false },
      render: (email: string) => (
        <Tooltip title={email}>
          <span className="block truncate font-medium">{email}</span>
        </Tooltip>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      align: "center",
      ellipsis: true,
      responsive: ["sm"],
    },
  ];

  const roleAndDealerColumn: ColumnsType<IAccount> = [
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "roleWithDealer",
      align: "center",
      filters: isAdminTable
        ? [
            { text: ROLE_LABEL.MANAGER, value: Role.MANAGER },
            { text: ROLE_LABEL.EVM_STAFF, value: Role.EVM_STAFF },
          ]
        : undefined,
      onFilter: isAdminTable
        ? (value, record) => record.role === value
        : undefined,
      render: (_, record) => {
        const dealerName =
          record.role === Role.MANAGER && record.dealerId
            ? dealerMap[record.dealerId] || ""
            : "";

        return (
          <div className="flex flex-wrap items-center justify-center gap-1">
            <Tag color={ROLE_COLOR[record.role]} className="m-0">
              {ROLE_LABEL[record.role]}
            </Tag>
            {dealerName ? (
              <>
                <span className="text-sm text-[#505f44] font-medium leading-tight">
                  của đại lý:
                </span>
                <Tag className="m-0" color="gold">
                  <Paragraph
                    ellipsis={{ rows: 1 }}
                    style={{ margin: 0, maxWidth: 160 }}
                  >
                    {dealerName}
                  </Paragraph>
                </Tag>
              </>
            ) : null}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      filters: [
        { text: STATUS_LABEL.ACTIVE, value: AccountStatus.ACTIVE },
        { text: STATUS_LABEL.INACTIVE, value: AccountStatus.INACTIVE },
        { text: STATUS_LABEL.BANNED, value: AccountStatus.BANNED },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: AccountStatus) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
      ),
    },
  ];

  const actionColumn: ColumnsType<IAccount> = canModify
    ? [
        {
          title: "Thao tác",
          align: "center",
          onCell: () => ({ style: { paddingTop: 8, paddingBottom: 8 } }),
          render: (_, record) => {
            if (record.status === AccountStatus.BANNED) {
              return (
                <div className="flex items-center justify-center">
                  <Tag color="red" className="m-0">
                    Đã cấm vĩnh viễn
                  </Tag>
                </div>
              );
            }

            const isInactive = record.status === AccountStatus.INACTIVE;
            const nextStatus: "ACTIVE" | "INACTIVE" = isInactive
              ? "ACTIVE"
              : "INACTIVE";
            const mainLabel = isInactive ? "Mở lại" : "Tạm ngưng";

            return (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="small"
                  type={isInactive ? "primary" : "default"}
                  className={`h-8 px-3 rounded-md ${
                    isInactive
                      ? "!bg-[#627254] hover:!bg-[#525e46] text-white"
                      : ""
                  }`}
                  onClick={() => onChangeStatus(record.id, nextStatus)}
                >
                  {mainLabel}
                </Button>
                <Button
                  size="small"
                  danger
                  className="h-8 px-3 rounded-md"
                  onClick={() => onBan(record.id)}
                >
                  Cấm vĩnh viễn
                </Button>
              </div>
            );
          },
        },
      ]
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="rounded-2xl overflow-hidden">
        <Table<IAccount>
          className="
            bg-white
            [&_.ant-table-container]:!overflow-x-hidden
            [&_.ant-table-body]:!overflow-x-hidden
            [&_.ant-table-content]:!overflow-x-hidden
            [&_.ant-table-tbody>tr:hover>td]:!bg-white
            [&_.ant-table-row]:!transition-none
          "
          rowClassName={() => "bg-white"}
          rowKey={(r) => r.id || `${r.email}-${r.phone}`}
          columns={[...baseColumns, ...roleAndDealerColumn, ...actionColumn]}
          dataSource={data}
          loading={loading}
          bordered
          pagination={false}
          // chỉ scroll dọc, ẩn hoàn toàn scroll ngang bằng CSS ở trên
          scroll={{ y: TABLE_SCROLL_Y }}
          sticky={{ offsetHeader: 0 }}
        />
      </div>

      {pagination ? (
        <div className="p-3 flex justify-center">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger={pagination.showSizeChanger}
            onChange={pagination.onChange}
            showTotal={pagination.showTotal}
          />
        </div>
      ) : null}
    </div>
  );
};
