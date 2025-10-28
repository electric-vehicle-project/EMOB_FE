// src/components/molecules/Account/AccountTable.tsx
import { Table, Tag, Tooltip, Typography, Pagination, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IAccount } from "../../../model/Account";
import { AccountStatus, Role } from "../../../model/Account";

const { Paragraph } = Typography;

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
}

const colW = {
  name: 200,
  email: 240,
  phone: 150,
  address: 280,
  gender: 120,
  dob: 140,
  role: 260,
  status: 160,
  actions: 260,
};

const getRoleLabel = (role: Role) =>
  role === "ADMIN"
    ? "Quản trị viên"
    : role === "MANAGER"
    ? "Quản lý đại lý"
    : role === "DEALER_STAFF"
    ? "Nhân viên đại lý"
    : "Nhân viên EVM";

const getRoleColor = (role: Role) =>
  role === "MANAGER" ? "purple" : role === "DEALER_STAFF" ? "cyan" : "blue";

export const AccountTable: React.FC<Props> = ({
  data,
  loading,
  canModify,
  onChangeStatus,
  onBan,
  pagination,
  dealerMap = {},
  currentUserRole,
}) => {
  const isAdminTable = currentUserRole === Role.ADMIN;

  const baseColumns: ColumnsType<IAccount> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      align: "center",
      width: colW.name,
      fixed: "left",
      ellipsis: { showTitle: false },
      sorter: (a, b) =>
        (a.fullName || "").localeCompare(b.fullName || "", "vi", {
          sensitivity: "base",
        }),
      sortDirections: ["ascend", "descend"],
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="block truncate">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      width: colW.email,
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
      width: colW.phone,
      ellipsis: true,
      responsive: ["sm"],
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      align: "center",
      width: colW.address,
      render: (addr: string) => (
        <Tooltip title={addr}>
          <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
            {addr}
          </Paragraph>
        </Tooltip>
      ),
      responsive: ["md"],
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      align: "center",
      width: colW.gender,
      filters: [
        { text: "Nam", value: "MALE" },
        { text: "Nữ", value: "FEMALE" },
        { text: "Khác", value: "UNKNOWN" },
      ],
      onFilter: (value, record) => record.gender === value,
      render: (gender: string) => {
        const color =
          gender === "MALE"
            ? "blue"
            : gender === "FEMALE"
            ? "magenta"
            : "volcano";
        const label =
          gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác";
        return <Tag color={color}>{label}</Tag>;
      },
      responsive: ["md"],
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      align: "center",
      width: colW.dob,
      render: (dob: string) =>
        dob
          ? new Date(dob).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "—",
      responsive: ["md"],
    },
  ];

  const roleAndDealerColumn: ColumnsType<IAccount> = [
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "roleWithDealer",
      align: "center",
      width: colW.role,
      filters: isAdminTable
        ? [
            { text: "Quản lý đại lý", value: Role.MANAGER },
            { text: "Nhân viên EVM", value: Role.EVM_STAFF },
          ]
        : undefined,
      onFilter: isAdminTable
        ? (value, record) => record.role === value
        : undefined,
      render: (_, record) => {
        const roleTag = (
          <Tag color={getRoleColor(record.role)} className="m-0">
            {getRoleLabel(record.role)}
          </Tag>
        );
        const dealerName =
          record.role === Role.MANAGER && record.dealerId
            ? dealerMap[record.dealerId] || ""
            : "";
        return (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {roleTag}
            {dealerName ? (
              <>
                <span className="text-sm text-[#505f44] font-medium leading-tight">
                  của đại lý:
                </span>
                <Tag className="m-0" color="gold" style={{ maxWidth: 160 }}>
                  <Typography.Paragraph
                    ellipsis={{ rows: 1 }}
                    style={{ margin: 0 }}
                  >
                    {dealerName}
                  </Typography.Paragraph>
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
      width: colW.status,
      filters: [
        { text: "Hoạt động", value: AccountStatus.ACTIVE },
        { text: "Ngừng hoạt động", value: AccountStatus.INACTIVE },
        { text: "Đã cấm", value: AccountStatus.BANNED },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color =
          status === AccountStatus.ACTIVE
            ? "green"
            : status === AccountStatus.INACTIVE
            ? "orange"
            : "red";
        const label =
          status === AccountStatus.ACTIVE
            ? "Hoạt động"
            : status === AccountStatus.INACTIVE
            ? "Ngừng hoạt động"
            : "Đã cấm";
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const actionColumn: ColumnsType<IAccount> = canModify
    ? [
        {
          title: "Thao tác",
          align: "center",
          width: colW.actions,
          fixed: "right",
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
              <div className="flex items-center justify-center gap-2">
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
            [&_.ant-table-tbody>tr:hover>td]:!bg-white
            [&_.ant-table-row]:!transition-none
            [&_.ant-table-thead_th.ant-table-column-sort]:!bg-[#627254]
            [&_.ant-table-thead_th.ant-table-column-sort]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-column-sorter]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-filter-trigger]:!text-white
          "
          rowClassName={() => "bg-white"}
          rowKey={(r) => r.id || `${r.email}-${r.phone}`}
          columns={[...baseColumns, ...roleAndDealerColumn, ...actionColumn]}
          dataSource={data}
          loading={loading}
          bordered
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: "max-content", y: 560 }}
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
