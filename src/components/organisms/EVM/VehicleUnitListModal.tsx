import { Modal, Table, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import { useGetVehicleUnitsByVehicleId } from "../../../service/vehicleService";
import { useCurrentUser } from "../../../utils/getCurrentUser";

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
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  const { data = [], isLoading } = useGetVehicleUnitsByVehicleId(
    vehicleId ?? undefined
  );

  // Hiện chưa có API thật, nên chỉ toast giả lập
  const handleApprove = async (vinNumber: string) => {
    toast.info(`Duyệt xe ${vinNumber} (chức năng đang phát triển)`);
  };

  const columns: ColumnsType<VehicleUnitRow> = [
    { title: "Số khung (VIN)", dataIndex: "vinNumber" },
    { title: "Màu sắc", dataIndex: "color" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => {
        const color =
          status === "PENDING_APPROVAL"
            ? "orange"
            : status === "APPROVED"
            ? "green"
            : "blue";
        return <Tag color={color}>{status || "NORMAL"}</Tag>;
      },
    },
    { title: "Năm SX", dataIndex: "productionYear" },
    { title: "Ngày mua", dataIndex: "purchaseDate" },
    { title: "BH bắt đầu", dataIndex: "warrantyStart" },
    { title: "BH kết thúc", dataIndex: "warrantyEnd" },
    ...(role === "ADMIN"
      ? [
          {
            title: "Thao tác",
            align: "center" as const,
            render: (_: unknown, record: VehicleUnitRow) => (
              <Button
                type="primary"
                onClick={() => handleApprove(record.vinNumber)}
                className="rounded-md bg-[#627254] border-none hover:opacity-90"
              >
                Duyệt yêu cầu
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={950}
      title="Danh sách đơn vị xe"
    >
      <Table
        loading={isLoading}
        dataSource={data as VehicleUnitRow[]}
        columns={columns}
        rowKey={(r) => r.vinNumber}
        pagination={false}
      />
    </Modal>
  );
}
