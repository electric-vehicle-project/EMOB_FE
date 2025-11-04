/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Descriptions, Table } from "antd";

export const ContractDetailModal = ({ open, onClose, contract }: any) => {
  const itemColumns = [
    { title: "Vehicle ID", dataIndex: "vehicleId" },
    { title: "Color", dataIndex: "color" },
    { title: "Quantity", dataIndex: "quantity" },
    { title: "Unit Price", dataIndex: "unitPrice" },
    { title: "Total Price", dataIndex: "totalPrice" },
  ];

  return (
    <Modal
      title="Contract Detail"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {contract ? (
        <>
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Contract Number">
              {contract.contractNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Status">{contract.status}</Descriptions.Item>
            <Descriptions.Item label="Total Quantity">
              {contract.totalQuantity}
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              {contract.totalPrice?.toLocaleString("vi-VN")} ₫
            </Descriptions.Item>
          </Descriptions>

          <Table
            style={{ marginTop: 16 }}
            columns={itemColumns}
            dataSource={contract.items}
            pagination={false}
            rowKey="id"
            size="small"
          />
        </>
      ) : (
        <p>No data</p>
      )}
    </Modal>
  );
};
