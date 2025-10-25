import React from "react";
import { Table, Tag, Spin } from "antd";
import { useDealerDiscountPolicyList } from "../../service/dealerDiscountPolicyService";
import { useGetDealers } from "../../service/dealerService";

const DealerDiscountPolicyPage: React.FC<{ dealerId: string }> = ({
  dealerId,
}) => {
  const { data, isLoading } = useGetDealers(dealerId, 0, 20);
  const policies = data?.result || [];

  const columns = [
    {
      title: "Dealer Name",
      dataIndex: ["dealer", "name"], // ✅ Truy cập field con trong object
      key: "dealerName",
      render: (name: string) => name || "—",
    },
    {
      title: "Vehicle Model",
      dataIndex: ["vehicle", "modelName"], // ✅ tương tự
      key: "vehicleModel",
      render: (name: string) => name || "—",
    },
    { title: "Final Price", dataIndex: "finalPrice", key: "finalPrice" },
    {
      title: "Custom Multiplier",
      dataIndex: "customMultiplier",
      key: "customMultiplier",
    },
    {
      title: "Effective Date",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
    },
    { title: "Expiry Date", dataIndex: "expiryDate", key: "expiryDate" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "UPCOMING"
            ? "orange"
            : status === "ACTIVE"
            ? "green"
            : "gray";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dealer Discount Policies</h2>
      {isLoading ? (
        <Spin />
      ) : (
        <Table
          dataSource={policies}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default DealerDiscountPolicyPage;
