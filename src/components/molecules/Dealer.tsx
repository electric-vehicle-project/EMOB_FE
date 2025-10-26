import React from "react";
import { Table } from "antd";

export type DealerProps = {
  data?: any[];
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
