/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

interface Props {
  vehicles: any[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const FreeVehicleCardList = ({ vehicles, selectedId, onSelect }: Props) => {
  if (!vehicles?.length)
    return (
      <div className="text-center text-gray-500 italic mt-3">
        Không có xe nào khả dụng cho khung giờ này.
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      {vehicles.map((v) => {
        const isSelected = v.vehicleUnitId === selectedId;
        return (
          <Card
            key={v.vehicleUnitId}
            onClick={() => onSelect(v.vehicleUnitId)}
            className={`transition-all cursor-pointer border rounded-xl ${
              isSelected
                ? "border-[#627254] shadow-md bg-[#f7f9f7]"
                : "border-gray-200 hover:shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{v.vinNumber}</div>
                <div className="text-sm text-gray-500">
                  {v.color || "Không rõ màu"}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Tình trạng: {v.status}
                </div>
              </div>
              {isSelected && (
                <CheckCircleFilled className="text-[#627254] text-lg" />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
