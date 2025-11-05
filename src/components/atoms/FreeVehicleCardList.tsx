/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Col, Row, Empty } from "antd";

interface FreeVehicleCardListProps {
  vehicles: any[];
  onSelect: (vehicleId: string) => void;
  selectedVehicleId?: string;
}

export const FreeVehicleCardList = ({
  vehicles,
  onSelect,
  selectedVehicleId,
}: FreeVehicleCardListProps) => {
  if (!vehicles || vehicles.length === 0) {
    return <Empty description="Không có xe trống lịch" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {vehicles.map((v) => (
        <Col span={12} key={v.id}>
          <Card
            hoverable
            onClick={() => onSelect(v.id)}
            className={`cursor-pointer border transition-all duration-200 ${
              selectedVehicleId === v.id
                ? "!border-[#627254] bg-[#f8f8f4]"
                : "hover:border-[#627254]"
            }`}
            title={`${v.model} - ${v.licensePlate ?? "Không biển số"}`}
          >
            <p>
              <strong>Trạng thái:</strong> {v.status}
            </p>
            <p>
              <strong>Màu sắc:</strong> {v.color ?? "N/A"}
            </p>
            <p>
              <strong>Số VIN:</strong> {v.vin ?? "N/A"}
            </p>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
