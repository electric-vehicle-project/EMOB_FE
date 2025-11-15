import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IDealerPointRule } from "../../../model/DealerPointRule";
import { EMOBTable } from "../../molecules/EMOBTable";

interface Props {
  data: (IDealerPointRule & { dealerName?: string })[];
  loading?: boolean;
}

export const DealerPointRuleAdminTable: React.FC<Props> = ({
  data,
  loading,
}) => {
  const getLevelColor = (level: string): string => {
    switch (level) {
      case "BRONZE":
        return "volcano";
      case "SILVER":
        return "gray";
      case "GOLD":
        return "gold";
      case "PLATINUM":
        return "geekblue";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<IDealerPointRule & { dealerName?: string }> = [
    {
      title: "Tên đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      align: "center",
      width: 220,
      render: (v) => v ?? "Không xác định",
    },
    {
      title: "Cấp độ hội viên",
      dataIndex: "membershipLevel",
      key: "membershipLevel",
      align: "center",
      width: 160,
      render: (level) => (
        <Tag color={getLevelColor(level)} className="font-medium">
          {level}
        </Tag>
      ),
    },
    {
      title: "Điểm tối thiểu",
      dataIndex: "minPoints",
      key: "minPoints",
      width: 160,
      align: "center",
      render: (v: number) => v.toLocaleString("vi-VN"),
    },
    {
      title: "Giá quy đổi (₫)",
      dataIndex: "price",
      key: "price",
      width: 180,
      align: "center",
      render: (v: number) => `${v.toLocaleString("vi-VN")} ₫`,
    },
  ];

  return (
    <EMOBTable
      rowKey={(r) => `${r.dealerId}-${r.membershipLevel}`}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
    />
  );
};
