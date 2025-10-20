import { Card, Tag } from "antd";
import type { IVehicle } from "../../../model/Vehicle";

interface Props {
  vehicle: IVehicle;
  onViewDetail: () => void;
}

export const VehicleCard = ({ vehicle, onViewDetail }: Props) => {
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
      </div>
    </Card>
  );
};
