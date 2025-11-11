import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IDealerPointRule } from "../../../model/DealerPointRule";

interface Props {
  data: (IDealerPointRule & { dealerName?: string })[];
  loading?: boolean;
}

const headerStyle: React.CSSProperties = {
  backgroundColor: "#394e31",
  color: "#fff",
  ["--ant-table-header-sort-active-bg" as unknown as string]: "#394e31",
};

export const DealerPointRuleAdminTable: React.FC<Props> = ({
  data,
  loading,
}) => {
  const columns: ColumnsType<IDealerPointRule & { dealerName?: string }> = [
    {
      title: "Tên đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (val) => val ?? "Không xác định",
    },
    {
      title: "Cấp độ hội viên",
      dataIndex: "membershipLevel",
      key: "membershipLevel",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (level: string) => <Tag color="geekblue">{level}</Tag>,
    },
    {
      title: "Điểm tối thiểu",
      dataIndex: "minPoints",
      key: "minPoints",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (value: number) => (
        <span className="text-gray-800 font-medium">
          {value.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Giá quy đổi (₫)",
      dataIndex: "price",
      key: "price",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (value: number) => (
        <span className="text-gray-800 font-medium">
          {value.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
  ];

  return (
    <Table
      bordered
      rowKey={(r) => `${r.dealerId}-${r.membershipLevel}`}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="middle"
      scroll={{ x: "max-content", y: 560 }}
      sticky={{ offsetHeader: 0 }}
      className="bg-white [&_.ant-table-thead>tr>th]:!text-white"
    />
  );
};
