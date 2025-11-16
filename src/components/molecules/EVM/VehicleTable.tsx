import React from "react";
import { Table, Tooltip, Typography } from "antd";
import { Button as EmobButton } from "../../atoms/Button";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import type { IVehicle } from "../../../model/Vehicle";
import dayjs from "dayjs";

const { Text } = Typography;

interface Props {
  data: IVehicle[];
  onEdit: (vehicle: IVehicle) => void;
  onDelete: (id: string) => void;
  onAddUnit: (vehicleId: string) => void;
  canAddUnit?: boolean;
}

export const VehicleTable: React.FC<Props> = ({
  data,
  onEdit,
  onDelete,
  onAddUnit,
  canAddUnit = false,
}) => {
  const columns: ColumnsType<IVehicle> = [
    {
      title: "Mã xe",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (id?: string) =>
        id ? (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title={id}>
              <Text code className="text-xs">
                {id.slice(0, 8)}…
              </Text>
            </Tooltip>
            <Tooltip title="Copy ID">
              <EmobButton
                icon={<CopyOutlined />}
                onClick={() => navigator.clipboard.writeText(id)}
              />
            </Tooltip>
          </div>
        ) : (
          "—"
        ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      align: "center",
      render: (images?: string[]) => {
        const src =
          images?.[0] || "https://via.placeholder.com/60x60?text=No+Image";
        return (
          <Tooltip
            title={
              images && images.length > 0 ? (
                <img
                  src={src}
                  alt="vehicle"
                  className="w-40 h-40 object-cover rounded-md"
                />
              ) : (
                "Không có ảnh"
              )
            }
          >
            <img
              src={src}
              alt="vehicle"
              className="w-14 h-14 object-cover rounded-md shadow-sm border border-gray-200"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/60x60?text=No+Image")
              }
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Hãng xe",
      dataIndex: "brand",
      key: "brand",
      align: "center",
      sorter: (a, b) => (a.brand || "").localeCompare(b.brand || ""),
    },
    {
      title: "Mẫu xe",
      dataIndex: "model",
      key: "model",
      align: "center",
      sorter: (a, b) => (a.model || "").localeCompare(b.model || ""),
    },
    {
      title: "Giá nhập (₫)",
      dataIndex: "importPrice",
      key: "importPrice",
      align: "center",
      render: (v?: number) =>
        typeof v === "number" ? v.toLocaleString("vi-VN") : "—",
    },
    {
      title: "Giá bán lẻ (₫)",
      dataIndex: "retailPrice",
      key: "retailPrice",
      align: "center",
      render: (v?: number) =>
        typeof v === "number" ? v.toLocaleString("vi-VN") : "—",
    },
    { title: "Dung lượng pin (kWh)", dataIndex: "batteryKwh", align: "center" },
    { title: "Tầm hoạt động (km)", dataIndex: "rangeKm", align: "center" },
    {
      title: "Thời gian sạc (giờ)",
      dataIndex: "chargeTimeHr",
      align: "center",
    },
    { title: "Công suất (kW)", dataIndex: "powerKw", align: "center" },
    { title: "Khối lượng (kg)", dataIndex: "weightKg", align: "center" },
    {
      title: "Tốc độ tối đa (km/h)",
      dataIndex: "topSpeedKmh",
      align: "center",
    },
    { title: "Loại xe", dataIndex: "type", align: "center" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      align: "center",
      render: (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_: unknown, record: IVehicle) => (
        <div className="flex justify-center items-center gap-2 flex-wrap mx-auto">
          {canAddUnit && (
            <EmobButton
              icon={<PlusOutlined />}
              onClick={() => onAddUnit(record.id!)}
              className="rounded-md border-none bg-[#a8b57a] text-white hover:opacity-90 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Nhập xe hàng loạt
            </EmobButton>
          )}
          <EmobButton
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="rounded-md bg-[#627254] border-none hover:opacity-90 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sửa
          </EmobButton>
          <EmobButton
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id!)}
            className="rounded-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Xóa
          </EmobButton>
        </div>
      ),
    },
  ];

  return (
    <Table<IVehicle>
      rowKey="id"
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
      rowClassName={() =>
        "text-center transition-colors duration-200 hover:bg-[#f7f9f4]"
      }
      expandable={{
        // expandedRowRender: (record) => <UnitsSubtable vehicleId={record.id!} />,
        rowExpandable: (record) => !!record.id,
      }}
      scroll={{ x: true }}
      size="middle"
    />
  );
};
