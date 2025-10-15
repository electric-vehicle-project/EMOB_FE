import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useGetVehicleUnitsByVehicleId as useGetVehicleUnits } from "../../service/vehicleService";

type Props = {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null;
};

type VehicleUnitRow = {
  vinNumber: string;
  color: string;
  status: string;
  productionYear?: string;
  purchaseDate?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
};

export default function VehicleUnitListModal({
  open,
  onClose,
  vehicleId,
}: Props) {
  const { data = [], isLoading } = useGetVehicleUnits(vehicleId ?? undefined);

  const columns: ColumnsType<VehicleUnitRow> = [
    { title: "Số khung (VIN)", dataIndex: "vinNumber" },
    { title: "Màu sắc", dataIndex: "color" },
    { title: "Tình trạng", dataIndex: "status" },
    { title: "Năm SX", dataIndex: "productionYear" },
    { title: "Ngày mua", dataIndex: "purchaseDate" },
    { title: "BH bắt đầu", dataIndex: "warrantyStart" },
    { title: "BH kết thúc", dataIndex: "warrantyEnd" },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title="Danh sách đơn vị xe"
    >
      <Table
        loading={isLoading}
        dataSource={data as VehicleUnitRow[]}
        columns={columns}
        rowKey={(r) => r.vinNumber}
      />
    </Modal>
  );
}
