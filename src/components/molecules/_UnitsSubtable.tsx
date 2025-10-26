import { Table, Tag, Empty, Spin } from "antd";
import { useGetVehicleUnitsByVehicleId } from "../../service/vehicleService";
import { formatDateVietnam } from "../../utils/timeFeature";

interface Props {
  vehicleId: string;
}

export interface IUnit {
  vinNumber: string;
  color: string;
  productionYear: string;
  status: "IN_STOCK" | "SOLD" | "DAMAGED";
  createdAt?: string;
}

const statusColor = {
  IN_STOCK: "green",
  SOLD: "blue",
  DAMAGED: "red",
};

const UnitsSubtable = ({ vehicleId }: Props) => {
  const { data, isLoading } = useGetVehicleUnitsByVehicleId(vehicleId);
  const units: IUnit[] = data?.result || [];

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <Spin tip="Đang tải danh sách đơn vị xe..." />
      </div>
    );
  }

  if (!units?.length) {
    return (
      <div className="py-4">
        <Empty description="Chưa có đơn vị xe nào trong kho" />
      </div>
    );
  }

  return (
    <Table
      size="small"
      rowKey={(r) => r.vinNumber}
      columns={[
        { title: "Mã đơn vị (VIN nội bộ)", dataIndex: "vinNumber" },
        { title: "Màu sắc", dataIndex: "color" },
        {
          title: "Năm sản xuất",
          dataIndex: "productionYear",
          render: (v) => formatDateVietnam(v),
        },
        {
          title: "Ngày nhập kho",
          dataIndex: "createdAt",
          render: (v) => (v ? formatDateVietnam(v) : "—"),
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          render: (s: IUnit["status"]) => <Tag color={statusColor[s]}>{s}</Tag>,
        },
      ]}
      dataSource={units}
      pagination={false}
    />
  );
};

export default UnitsSubtable;
