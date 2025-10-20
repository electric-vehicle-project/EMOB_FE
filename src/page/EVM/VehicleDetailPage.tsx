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
import { useQueryClient } from "@tanstack/react-query";

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  const { data, isLoading } = useGetVehicleById(id ?? "");
  const deleteVehicle = useDeleteVehicle();
  const vehicle = data?.result;

  // ✅ Loading state
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );

  // ✅ Không tìm thấy xe
  if (!vehicle)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Card className="max-w-3xl w-full text-center shadow-md rounded-2xl">
          <p className="mb-4">Không tìm thấy xe.</p>
          {/* ✅ Luôn quay về danh sách thay vì history back */}
          <Button
            type="primary"
            onClick={() =>
              navigate("/dashboard/evm/vehicle", { replace: true })
            }
          >
            Quay lại
          </Button>
        </Card>
      </div>
    );

  // ✅ Xử lý xóa
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
          await deleteVehicle.mutateAsync(id!);
          // Invalidate + refetch danh sách
          await queryClient.invalidateQueries({
            queryKey: ["vehicles"],
            exact: false,
          });
          await queryClient.refetchQueries({
            queryKey: ["vehicles"],
            exact: false,
          });
          message.success("🚮 Xe đã được xóa thành công!");
          // ✅ Về danh sách và không quay lại được trang detail nữa
          navigate("/dashboard/evm/vehicle", { replace: true });
        } catch (error: unknown) {
          // ❌ không dùng any: unknown + thu hẹp kiểu
          const errMsg =
            typeof error === "object" &&
            error !== null &&
            "response" in error &&
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
              ? (error as { response: { data: { message: string } } }).response
                  .data.message
              : "❌ Không thể xóa xe!";
          console.error("❌ Delete error:", error);
          message.error(errMsg);
        }
      },
    });
  };

  // ✅ Chuẩn hóa mảng ảnh để tránh lỗi key/url
  const imageList: string[] = Array.isArray(vehicle.images)
    ? vehicle.images
        .map((u: unknown) => (typeof u === "string" ? u : ""))
        .filter((u: string) => !!u && /^https?:\/\//i.test(u)) // chỉ nhận URL hợp lệ http/https
    : [];

  return (
    <div className="flex justify-center items-start min-h-[90vh] py-10 bg-gray-50">
      <Card
        title={`${vehicle.brand ?? "—"} – ${vehicle.model ?? "—"}`}
        extra={
          // ✅ Nút quay lại luôn về trang quản lý xe (không back về edit)
          <Button
            type="default"
            onClick={() =>
              navigate("/dashboard/evm/vehicle", { replace: true })
            }
          >
            Quay lại
          </Button>
        }
        className="w-full max-w-5xl shadow-md rounded-2xl"
      >
        <Space direction="vertical" className="w-full">
          <Image.PreviewGroup>
            {imageList.length > 0 ? (
              imageList.map((url) => (
                <Image
                  key={url}
                  width={220}
                  src={url}
                  alt="vehicle"
                  // Fallback nếu ảnh lỗi
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/220x140?text=No+Image";
                  }}
                />
              ))
            ) : (
              <Image
                width={220}
                src="https://via.placeholder.com/220x140?text=No+Image"
                alt="vehicle"
              />
            )}
          </Image.PreviewGroup>

          <Descriptions
            bordered
            column={2}
            className="mt-4 bg-white rounded-xl"
          >
            <Descriptions.Item label="Hãng">
              {vehicle.brand ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Mẫu">
              {vehicle.model ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Dung lượng pin">
              {typeof vehicle.batteryKwh === "number"
                ? `${vehicle.batteryKwh} kWh`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Tầm hoạt động">
              {typeof vehicle.rangeKm === "number"
                ? `${vehicle.rangeKm} km`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sạc">
              {typeof vehicle.chargeTimeHr === "number"
                ? `${vehicle.chargeTimeHr} giờ`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Công suất">
              {typeof vehicle.powerKw === "number"
                ? `${vehicle.powerKw} kW`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Khối lượng">
              {typeof vehicle.weightKg === "number"
                ? `${vehicle.weightKg} kg`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Tốc độ tối đa">
              {typeof vehicle.topSpeedKmh === "number"
                ? `${vehicle.topSpeedKmh} km/h`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá nhập">
              {typeof vehicle.importPrice === "number"
                ? `${vehicle.importPrice.toLocaleString("vi-VN")} ₫`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá bán lẻ">
              {typeof vehicle.retailPrice === "number"
                ? `${vehicle.retailPrice.toLocaleString("vi-VN")} ₫`
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color="green">{vehicle.type ?? "—"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {vehicle.createdAt ?? "—"}
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
