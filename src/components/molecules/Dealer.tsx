import React from "react";
import { Table } from "antd";

type DealerData = {
  region: string;
  sales: string | number;
  debt: string | number;
};

export type DealerProps = {
  data?: DealerData[];
};
const Dealer: React.FC<DealerProps> = ({ data }) => {
  const columns = [
    { title: "Khu vực", dataIndex: "region" },
    { title: "Doanh số", dataIndex: "sales" },
    { title: "Công nợ", dataIndex: "debt" },
  ];
  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey="region"
      rowClassName="hover:bg-gray-50 transition-colors"
    />
  );
};

export default Dealer;
