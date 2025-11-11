import React from "react";
import { Modal, Descriptions, Table, Empty, Spin, Tag } from "antd";
import { useGetVehicleRequestById } from "../../service/vehicleRequestService";
import type { IVehicleRequestItem } from "../../model/VehicleRequest";
import { useGetVehicleById } from "../../service/vehicleService";

interface Props {
  open: boolean;
  requestId: string;
  onClose: () => void;
}
// component convert VehicleId thành vehicleName
const VehicleModelName: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
  const { data, isLoading } = useGetVehicleById(vehicleId);
  if (isLoading) return <span>...</span>;
  return <span>{data?.result?.model || "-"}</span>;
};
const ViewVehicleRequestModal: React.FC<Props> = ({
  open,
  requestId,
  onClose,
}) => {
  const { data, isLoading } = useGetVehicleRequestById(requestId);

  // Nếu API có dữ liệu thì lấy, nếu không có thì dùng mock
  const request = data?.result || {
    id: "MOCK-12345678",
    status: "PENDING",
    totalQuantity: 3,
    totalPrice: 150000000,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: "item-001",
        vehicleId: "V001",
        vehicleStatus: "SPECIAL",
        color: "Đỏ",
        quantity: 1,
        unitPrice: 50000000,
        totalPrice: 50000000,
      },
      {
        id: "item-002",
        vehicleId: "V002",
        vehicleStatus: "NORMAL",
        color: "Xanh",
        quantity: 2,
        unitPrice: 50000000,
        totalPrice: 100000000,
      },
    ],
  };

  const items: IVehicleRequestItem[] = request.items || [];
  const statusColor =
    request.status === "APPROVED"
      ? "green"
      : request.status === "REJECTED"
      ? "red"
      : "gold";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={900}
      title={<span className="text-lg font-semibold">Chi tiết yêu cầu xe</span>}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Descriptions bordered column={2} className="mb-4">
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColor}>{request.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng SL">
              {request.totalQuantity}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giá trị">
              {request.totalPrice?.toLocaleString("vi-VN")} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={2}>
              {new Date(request.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>

          <h3 className="mt-4 mb-2 font-semibold text-lg">
            Danh sách xe trong yêu cầu
          </h3>

          {items.length === 0 ? (
            <Empty description="Không có xe nào trong yêu cầu này" />
          ) : (
            <Table
              className="mt-2"
              dataSource={items}
              rowKey="id"
              pagination={false}
              bordered
              columns={[
                {
                  title: "Mã xe",
                  dataIndex: "vehicleId",
                  key: "vehicleId",
                  render: (vehicleId: string) =>
                    vehicleId ? (
                      <VehicleModelName vehicleId={vehicleId} />
                    ) : (
                      "-"
                    ),
                },
                { title: "Màu sắc", dataIndex: "color", key: "color" },
                {
                  title: "Trạng thái",
                  dataIndex: "vehicleStatus",
                  key: "vehicleStatus",
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  align: "center",
                  key: "quantity",
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unitPrice",
                  align: "right",
                  key: "unitPrice",
                  render: (p) => `${p.toLocaleString("vi-VN")} ₫`,
                },
                {
                  title: "Thành tiền",
                  dataIndex: "totalPrice",
                  align: "right",
                  key: "totalPrice",
                  render: (p) => `${p.toLocaleString("vi-VN")} ₫`,
                },
              ]}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ViewVehicleRequestModal;
