// src/components/organisms/EVM/_UnitsSubtable.tsx
import { Table, Tag, Empty, Spin } from "antd";
import dayjs from "dayjs";
import { useGetVehicleUnitsByVehicleId } from "../../../service/vehicleService";

interface Props {
  vehicleId: string;
}

type UnitRow = {
  vehicleUnitId: string;
  vinNumber: string;
  color: string;
  productionYear?: string;
  purchaseDate?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  status:
    | "NORMAL"
    | "SPECIAL"
    | "OLD_STOCK"
    | "TEST_DRIVE"
    | "RESERVED"
    | "SOLD";
  price?: number;
};

const statusColor: Record<UnitRow["status"], string> = {
  NORMAL: "green",
  SPECIAL: "purple",
  OLD_STOCK: "orange",
  TEST_DRIVE: "blue",
  RESERVED: "gold",
  SOLD: "red",
};

const UnitsSubtable = ({ vehicleId }: Props) => {
  const { data, isLoading } = useGetVehicleUnitsByVehicleId(vehicleId, 0, 5);
  const rows = (data as { data?: UnitRow[] })?.data ?? [];

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <Spin tip="Đang tải danh sách lô xe..." />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="py-4">
        <Empty description="Chưa có đơn vị xe nào trong kho" />
      </div>
    );
  }

  return (
    <Table<UnitRow>
      size="small"
      rowKey={(r) => r.vehicleUnitId}
      columns={[
        { title: "VIN", dataIndex: "vinNumber" },
        { title: "Màu sắc", dataIndex: "color" },
        {
          title: "Năm SX",
          dataIndex: "productionYear",
          render: (v?: string) => (v ? dayjs(v).format("YYYY") : "—"),
        },
        {
          title: "Ngày mua",
          dataIndex: "purchaseDate",
          render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD") : "—"),
        },
        {
          title: "Bảo hành",
          render: (r: UnitRow) =>
            `${
              r.warrantyStart ? dayjs(r.warrantyStart).format("YY-MM-DD") : "—"
            } → ${
              r.warrantyEnd ? dayjs(r.warrantyEnd).format("YY-MM-DD") : "—"
            }`,
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          render: (s: UnitRow["status"]) => (
            <Tag color={statusColor[s]}>{s}</Tag>
          ),
        },
        {
          title: "Giá nhập",
          dataIndex: "price",
          render: (p?: number) => (p ? `${p.toLocaleString("vi-VN")}₫` : "—"),
        },
      ]}
      dataSource={rows}
      pagination={false}
    />
  );
};

export default UnitsSubtable;
