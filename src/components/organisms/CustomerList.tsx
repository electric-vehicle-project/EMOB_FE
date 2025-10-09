import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ICustomer } from "../../model/Customer";

const STATUS_COLOR: Record<string, "success" | "warning" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  BANNED: "error",
};

export const CustomerList: React.FC<{ data: ICustomer[] }> = ({ data }) => {
  const columns: ColumnsType<ICustomer> = [
    { title: "ID", dataIndex: "customerID", key: "customerID", width: 120 },
    { title: "Full name", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 150 },
    {
      title: "Membership",
      dataIndex: "membershipLevel",
      key: "membershipLevel",
      render: (v: string) => <Tag>{v}</Tag>,
      width: 140,
    },
    {
      title: "Points",
      dataIndex: "loyaltyPoints",
      key: "loyaltyPoints",
      width: 110,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={STATUS_COLOR[v] || undefined}>{v}</Tag>
      ),
      width: 120,
    },
    {
      title: "DOB",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      // dateOfBirth đang là "YYYY-MM-DD" -> hiển thị nguyên vẹn
      render: (v: string) => v,
      width: 130,
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Table rowKey="customerID" columns={columns} dataSource={data} />
    </div>
  );
};
