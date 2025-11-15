import { useVehicleUnitByUnitId } from "../../../service/vehicleUnitService";
import dayjs from "dayjs";

interface Props {
  vehicleUnitId: string;
}

const statusMap: Record<string, string> = {
  SPECIAL: "Xe đặc biệt",
  TEST_DRIVE: "Xe lái thử",
  RESERVED: "Xe đã được giữ chỗ",
  OLD_STOCK: "Xe tồn kho cũ",
  NORMAL: "Xe tiêu chuẩn",
  SOLD: "Đã bán",
};

export const VehicleUnitCard = ({ vehicleUnitId }: Props) => {
  const { data, isLoading } = useVehicleUnitByUnitId(vehicleUnitId);
  const unit = data?.result;

  if (isLoading) {
    return <li className="text-gray-500 text-sm">Đang tải thông tin xe...</li>;
  }

  if (!unit) {
    return <li className="text-gray-500 text-sm">Không tìm thấy dữ liệu xe</li>;
  }

  return (
    <li className="p-3 rounded-lg bg-white shadow-sm border text-[14px]">
      <p><b>VIN:</b> {unit.vinNumber}</p>
      <p><b>Loại xe/trạng thái:</b> {statusMap[unit.status]}</p>
      <p><b>Năm sản xuất:</b> {dayjs(unit.productionYear).format("YYYY")}</p>
    </li>
  );
};
