import { Table } from "antd";
import React from "react";
export type InventoryProps = {
  data?: any[];
};
const InventoryTable: React.FC<InventoryProps> = ({ data }) => {
  const columns = [
    { title: "Loại xe", dataIndex: "type" },
    { title: "Xe nhập", dataIndex: "imported" },
    { title: "Xe xuất", dataIndex: "exported" },
    { title: "Xe tồn", dataIndex: "remaining" },
  ];
  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey="type"
      rowClassName="hover:bg-gray-50 transition-colors"
    />
  );
};

export default InventoryTable;
