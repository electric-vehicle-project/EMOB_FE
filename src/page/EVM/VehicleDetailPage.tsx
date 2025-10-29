// src/page/EVM/VehicleDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetVehicleById,
  useDeleteVehicle,
} from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { Button, Image, message, Spin, Tag, Modal, Divider } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  RollbackOutlined,
  PlusOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { VehicleUnitListModal } from "./VehicleUnitListModal";
import { ROUTES } from "../../model/routePaths";
import CardWrapper from "../../components/template/CardWrapper";

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  const basePath =
    role === "ADMIN"
      ? "/admin"
      : role === "EVM_STAFF"
      ? "/evm_staff"
      : role === "MANAGER"
      ? "/manager"
      : "/dealer_staff";

  const { data, isLoading } = useGetVehicleById(id ?? "");
  const deleteVehicle = useDeleteVehicle();
  const vehicle = data?.result;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openUnits, setOpenUnits] = useState(false);

  if (isLoading) {
    return (
      <CardWrapper
        title="Chi tiết xe"
        subtitle="Đang tải dữ liệu…"
        variant="dashboard"
      >
        <div className="flex justify-center items-center h-[50vh]">
          <Spin size="large" />
        </div>
      </CardWrapper>
    );
  }

  if (!vehicle) {
    return (
      <CardWrapper
        title="Chi tiết xe"
        subtitle="Không tìm thấy xe trong hệ thống."
        variant="dashboard"
      >
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-lg font-medium text-gray-700">
            Không tìm thấy xe.
          </p>
          <Button
            type="primary"
            onClick={() =>
              navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`, { replace: true })
            }
            style={{ background: "#627254" }}
          >
            Quay lại danh sách
          </Button>
        </div>
      </CardWrapper>
    );
  }

  const imageList: string[] = Array.isArray(vehicle.images)
    ? vehicle.images.filter((u: string) => !!u && /^https?:\/\//i.test(u))
    : [];

  // ✅ Dùng placehold.co thay vì via.placeholder.com
  const FALLBACK_IMG = "https://placehold.co/500x350?text=No+Image";
  const mainImage = selectedImage || imageList[0] || FALLBACK_IMG;

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
          await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
          message.success("🚮 Xe đã được xóa thành công!");
          navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`, { replace: true });
        } catch {
          message.error("❌ Không thể xóa xe!");
        }
      },
    });
  };

  const canEdit = role === "EVM_STAFF";
  const canUpdatePrice = role === "ADMIN";

  return (
    <CardWrapper
      title="Chi tiết xe"
      subtitle="Xem thông tin cấu hình, giá và thao tác quản lý."
      variant="dashboard"
    >
      <div className="flex flex-col lg:flex-row gap-10">
        {/* 🖼️ Hình ảnh */}
        <div className="flex-1 flex flex-col items-center">
          <Image
            src={mainImage}
            alt="vehicle"
            width={450}
            height={320}
            className="rounded-xl shadow-sm object-cover border border-gray-100"
            onError={(e) => {
              // ✅ Rơi vào fallback ổn định
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
            }}
          />
          {imageList.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              {imageList.map((url) => (
                <img
                  key={url}
                  src={url}
                  onClick={() => setSelectedImage(url)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border ${
                    selectedImage === url
                      ? "border-green-600 ring-2 ring-green-500"
                      : "border-gray-200"
                  }`}
                  alt="thumbnail"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://placehold.co/80x80?text=No";
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 📋 Thông tin */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {vehicle.brand ?? "—"}{" "}
            <span className="text-gray-600">– {vehicle.model ?? "—"}</span>
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Mã xe: <span className="font-mono">{vehicle.id}</span>
          </p>

          <Divider />

          <div className="grid grid-cols-2 gap-y-2 text-gray-700 text-base">
            <p>
              <strong>Dung lượng pin:</strong> {vehicle.batteryKwh ?? "—"} kWh
            </p>
            <p>
              <strong>Tầm hoạt động:</strong> {vehicle.rangeKm ?? "—"} km
            </p>
            <p>
              <strong>Thời gian sạc:</strong> {vehicle.chargeTimeHr ?? "—"} giờ
            </p>
            <p>
              <strong>Công suất:</strong> {vehicle.powerKw ?? "—"} kW
            </p>
            <p>
              <strong>Khối lượng:</strong> {vehicle.weightKg ?? "—"} kg
            </p>
            <p>
              <strong>Tốc độ tối đa:</strong> {vehicle.topSpeedKmh ?? "—"} km/h
            </p>
            <p>
              <strong>Giá nhập:</strong>{" "}
              <span className="font-semibold text-green-700">
                {vehicle.importPrice
                  ? vehicle.importPrice.toLocaleString("vi-VN") + " ₫"
                  : "—"}
              </span>
            </p>
            <p>
              <strong>Giá bán lẻ:</strong>{" "}
              <span className="font-semibold text-red-600">
                {vehicle.retailPrice
                  ? vehicle.retailPrice.toLocaleString("vi-VN") + " ₫"
                  : "—"}
              </span>
            </p>
            <p>
              <strong>Loại:</strong>{" "}
              <Tag color="green" className="ml-2">
                {vehicle.type ?? "—"}
              </Tag>
            </p>
            <p>
              <strong>Ngày tạo:</strong> {vehicle.createdAt ?? "—"}
            </p>
          </div>

          <Divider />

          {/* 🔘 Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`)}
            >
              Quay lại
            </Button>

            {canEdit && (
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() =>
                    navigate(
                      `${basePath}/${ROUTES.EVM_VEHICLE_EDIT}`.replace(
                        ":id",
                        id!
                      )
                    )
                  }
                  style={{ backgroundColor: "#627254" }}
                >
                  Chỉnh sửa
                </Button>

                <Button
                  icon={<PlusOutlined />}
                  onClick={() =>
                    navigate(
                      `${basePath}/${ROUTES.EVM_VEHICLE_BULK}?vehicleId=${id}`
                    )
                  }
                >
                  Thêm đơn vị
                </Button>

                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  Xóa
                </Button>
              </>
            )}

            {canUpdatePrice && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() =>
                  navigate(
                    `${basePath}/${ROUTES.EVM_VEHICLE_PRICE_UPDATE}`.replace(
                      ":id",
                      id!
                    )
                  )
                }
                style={{ backgroundColor: "#3a5a40" }}
              >
                Cập nhật giá
              </Button>
            )}
          </div>
        </div>
      </div>

      <VehicleUnitListModal
        open={openUnits}
        onClose={() => setOpenUnits(false)}
        vehicleId={id ?? ""}
      />
    </CardWrapper>
  );
};
