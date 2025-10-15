import { Table, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IVehicle } from "../../model/Vehicle";
import UnitsSubtable from "./_UnitsSubtable";

interface Props {
  data: IVehicle[];
  onEdit: (vehicle: IVehicle) => void;
  onDelete: (id: string) => void;
  onAddUnit: (vehicleId: string) => void;
  canEditPrices?: boolean;
}

export const VehicleTable = ({
  data,
  onEdit,
  onDelete,
  onAddUnit,
  canEditPrices,
}: Props) => {
  const columns: ColumnsType<IVehicle> = [
    {
      title: "Hãng xe",
      dataIndex: "brand",
      key: "brand",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    { title: "Mẫu xe", dataIndex: "model", key: "model" },

    ...(canEditPrices
      ? [
          {
            title: "Giá nhập (VNĐ)",
            dataIndex: "importPrice",
            render: (v: number) => v?.toLocaleString("vi-VN"),
          },
          {
            title: "Giá bán lẻ (VNĐ)",
            dataIndex: "retailPrice",
            render: (v: number) => v?.toLocaleString("vi-VN"),
          },
        ]
      : []),

    { title: "Dung lượng pin (kWh)", dataIndex: "batteryKwh" },
    { title: "Tầm hoạt động (km)", dataIndex: "rangeKm" },
    { title: "Loại xe", dataIndex: "type" },

    {
      title: "Thao tác",
      align: "center",
      render: (_: unknown, record: IVehicle) => (
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            size="small"
            type="dashed"
            onClick={() => onAddUnit(record.id!)}
          >
            ➕ Thêm đơn vị
          </Button>
          <Button size="small" type="primary" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button size="small" danger onClick={() => onDelete(record.id!)}>
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      rowKey={(r) => r.id!}
      columns={columns}
      dataSource={data}
      pagination={false}
      expandable={{
        expandedRowRender: (record) => <UnitsSubtable vehicleId={record.id!} />,
        rowExpandable: (record) => !!record.id,
      }}
    />
  );
};
