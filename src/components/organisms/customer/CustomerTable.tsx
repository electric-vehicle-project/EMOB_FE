import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
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
}

export const CustomerTable = ({
  data,
  loading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: Props) => {
  const user = useSelector((state: RootState) => state.user);
  const role = (user as any)?.role;
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

  const columns: ColumnsType<ICustomer> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (text, record) => (
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
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Cấp độ",
      dataIndex: "memberShipLevel",
      key: "memberShipLevel",
      align: "center",
      filters: [
        { text: "NORMAL", value: "NORMAL" },
        { text: "BRONZE", value: "BRONZE" },
        { text: "SILVER", value: "SILVER" },
        { text: "GOLD", value: "GOLD" },
        { text: "PLATINUM", value: "PLATINUM" },
      ],
      onFilter: (value, record) => record.memberShipLevel === value,
      render: (level) => <Tag color="geekblue">{level}</Tag>,
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      align: "center",
      sorter: (a, b) =>
        dayjs(a.dateOfBirth).unix() - dayjs(b.dateOfBirth).unix(),
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "LEAD", value: "LEAD" },
        { text: "ACTIVE", value: "ACTIVE" },
        { text: "INACTIVE", value: "INACTIVE" },
        { text: "BLOCKED", value: "BLOCKED" },
        { text: "DELETED", value: "DELETED" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
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

  return (
    <Table
      bordered
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        position: ["bottomCenter"],
        showTotal: (total) => `Tổng cộng ${total} khách hàng`,
      }}
      scroll={{ x: "max-content", y: 560 }}
      sticky={{ offsetHeader: 0 }}
      className="
        bg-white
        [&_.ant-table-thead>tr>th]:!bg-[#627254]
        [&_.ant-table-thead>tr>th]:!text-white
      "
    />
  );
};
