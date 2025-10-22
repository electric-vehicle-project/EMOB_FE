import { Card, Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { IVehicle } from "../../../model/Vehicle";

interface Props {
  vehicle: IVehicle;
  onViewDetail: () => void;
  onViewUnits?: (vehicleId: string) => void;
}

export const VehicleCard = ({ vehicle, onViewDetail, onViewUnits }: Props) => {
  const img =
    vehicle.images?.[0] || "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <Card
      hoverable
      onClick={onViewDetail}
      cover={
        <img
          src={img}
          alt={vehicle.model}
          className="h-48 w-full object-cover rounded-t-xl"
        />
      }
      className="rounded-xl shadow-md border hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{vehicle.brand}</h3>
        <p className="text-gray-600">{vehicle.model}</p>
        <p className="font-medium text-gray-700">
          Giá bán:{" "}
          {vehicle.retailPrice
            ? `${vehicle.retailPrice.toLocaleString("vi-VN")} ₫`
            : "—"}
        </p>
        <Tag color="green">{vehicle.type}</Tag>

        {/* ✅ Nút xem lô xe */}
        {onViewUnits && (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onViewUnits(vehicle.id!);
            }}
            className="mt-2 p-0 h-auto"
          >
            Xem lô xe
          </Button>
        )}
      </div>
    </Card>
  );
};
