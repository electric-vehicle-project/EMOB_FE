import { useParams, useNavigate } from "react-router-dom";
import {
  useGetVehicleById,
  useDeleteVehicle,
} from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import {
  Button,
  Card,
  Descriptions,
  Image,
  message,
  Space,
  Spin,
  Tag,
  Modal,
} from "antd";
import { useQueryClient } from "@tanstack/react-query"; // ✅ Thêm dòng này

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ✅ tạo queryClient để invalidate cache

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  const { data, isLoading } = useGetVehicleById(id ?? "");
  const deleteVehicle = useDeleteVehicle();
  const vehicle = data?.result;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );

  if (!vehicle)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Card className="max-w-3xl w-full text-center shadow-md rounded-2xl">
          <p className="mb-4">Không tìm thấy xe.</p>
          <Button type="primary" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Card>
      </div>
    );

  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa xe",
      content: "Bạn có chắc chắn muốn xóa xe này khỏi hệ thống không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      centered: true,
      async onOk() {
        try {
          console.log("🟡 Xóa xe ID:", id);
          await deleteVehicle.mutateAsync(id!);

          // ✅ Invalidate tất cả query liên quan + refetch ngay lập tức
          await queryClient.invalidateQueries({
            queryKey: ["vehicles"],
            exact: false,
          });
          await queryClient.refetchQueries({
            queryKey: ["vehicles"],
            exact: false,
          });

          message.success("🚮 Xe đã được xóa thành công!");
          navigate("/dashboard/evm/vehicle");
        } catch (err: any) {
          console.error("❌ Delete error:", err?.response?.data || err);
          message.error(err?.response?.data?.message || "❌ Không thể xóa xe!");
        }
      },
    });
  };

  return (
    <div className="flex justify-center items-start min-h-[90vh] py-10 bg-gray-50">
      <Card
        title={`${vehicle.brand} – ${vehicle.model}`}
        extra={
          <Button type="default" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        }
        className="w-full max-w-5xl shadow-md rounded-2xl"
      >
        <Space direction="vertical" className="w-full">
          <Image.PreviewGroup>
            {vehicle.images?.map((url) => (
              <Image key={url} width={220} src={url} />
            ))}
          </Image.PreviewGroup>

          <Descriptions
            bordered
            column={2}
            className="mt-4 bg-white rounded-xl"
          >
            <Descriptions.Item label="Hãng">{vehicle.brand}</Descriptions.Item>
            <Descriptions.Item label="Mẫu">{vehicle.model}</Descriptions.Item>
            <Descriptions.Item label="Dung lượng pin">
              {vehicle.batteryKwh} kWh
            </Descriptions.Item>
            <Descriptions.Item label="Tầm hoạt động">
              {vehicle.rangeKm} km
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sạc">
              {vehicle.chargeTimeHr} giờ
            </Descriptions.Item>
            <Descriptions.Item label="Công suất">
              {vehicle.powerKw} kW
            </Descriptions.Item>
            <Descriptions.Item label="Khối lượng">
              {vehicle.weightKg} kg
            </Descriptions.Item>
            <Descriptions.Item label="Tốc độ tối đa">
              {vehicle.topSpeedKmh} km/h
            </Descriptions.Item>
            <Descriptions.Item label="Giá nhập">
              {vehicle.importPrice?.toLocaleString("vi-VN")} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Giá bán lẻ">
              {vehicle.retailPrice?.toLocaleString("vi-VN")} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color="green">{vehicle.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {vehicle.createdAt}
            </Descriptions.Item>
          </Descriptions>

          <div className="flex justify-end gap-3 mt-6">
            {role === "EVM_STAFF" && (
              <>
                <Button
                  type="primary"
                  onClick={() => navigate(`/dashboard/evm/vehicle/edit/${id}`)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/dashboard/evm/vehicle/bulk?vehicleId=${id}`)
                  }
                >
                  Thêm đơn vị
                </Button>
                <Button danger onClick={handleDelete}>
                  Xóa xe
                </Button>
              </>
            )}

            {role === "ADMIN" && (
              <Button
                type="primary"
                onClick={() => navigate(`/dashboard/evm/vehicle/prices/${id}`)}
              >
                Cập nhật giá
              </Button>
            )}
          </div>
        </Space>
      </Card>
    </div>
  );
};
