import React from "react";
import { Card, Tooltip, Typography } from "antd";
import {
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button as EmobButton } from "../../atoms/Button";
import type { IVehicle } from "../../../model/Vehicle";

const { Text } = Typography;

interface Props {
  data: IVehicle[];
  onEdit: (vehicle: IVehicle) => void;
  onDelete: (id: string) => void;
  onAddUnit: (vehicleId: string) => void;
  canAddUnit?: boolean;
}

export const VehicleCardList: React.FC<Props> = ({
  data,
  onEdit,
  onDelete,
  onAddUnit,
  canAddUnit = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((v) => {
        const img =
          v.images?.[0] || "https://via.placeholder.com/120?text=No+Image";
        return (
          <Card
            key={v.id}
            className="rounded-xl shadow-sm border border-gray-200"
            cover={
              <img
                src={img}
                alt="vehicle"
                className="h-40 w-full object-cover rounded-t-xl"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://via.placeholder.com/120?text=No+Image")
                }
              />
            }
          >
            <div className="flex justify-between items-center mb-2">
              <Tooltip title={v.id}>
                <Text code>{v.id?.slice(0, 8)}…</Text>
              </Tooltip>

              <EmobButton
                icon={<CopyOutlined />}
                onClick={() => navigator.clipboard.writeText(v.id!)}
              />
            </div>

            <p>
              <b>Hãng:</b> {v.brand || "—"}
            </p>
            <p>
              <b>Mẫu:</b> {v.model || "—"}
            </p>
            <p>
              <b>Giá nhập:</b> {v.importPrice?.toLocaleString("vi-VN") || "—"}
            </p>
            <p>
              <b>Giá bán:</b> {v.retailPrice?.toLocaleString("vi-VN") || "—"}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {canAddUnit && (
                <EmobButton
                  icon={<PlusOutlined />}
                  onClick={() => onAddUnit(v.id!)}
                  className="rounded-md bg-[#a8b57a] border-none text-white"
                >
                  Nhập xe hàng loạt
                </EmobButton>
              )}

              <EmobButton
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onEdit(v)}
                className="rounded-md bg-[#627254] border-none text-white"
              >
                Sửa
              </EmobButton>

              <EmobButton
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(v.id!)}
                className="rounded-md"
              >
                Xóa
              </EmobButton>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
