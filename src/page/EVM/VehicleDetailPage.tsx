// src/page/EVM/VehicleDetailPage.tsx
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  message,
  Popconfirm,
  Space,
  Tag,
} from "antd";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import type { ReactElement } from "react";
import type { ElectricVehicle } from "../../model/ElectricVehicle";
import type { Role } from "../../model/Account";
import {
  canAddVehicleBatch,
  canEditVehicle,
  canUpdatePrice,
  canViewDealerBatchesOnly,
  isEvmStaff,
  getRoleBasePath,
} from "../../utils/roleGuard";
import {
  useDeleteVehicle,
  useGetVehicleById,
} from "../../service/vehicleService";
import { VehicleCompareModal } from "../../components/organisms/vehicle/VehicleCompareModal";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ColumnWidthOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../model/routePaths";

type Sel = { auth?: { user?: { role?: Role | null } } };

export const VehicleDetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const role = useSelector((s: Sel) => s.auth?.user?.role) as
    | Role
    | null
    | undefined;

  const { data, isLoading, error } = useGetVehicleById(id, { enabled: !!id });
  // ✅ service đã unwrap → data chính là ElectricVehicle hoặc undefined
  const vehicle = (data ?? undefined) as ElectricVehicle | undefined;

  const deleteMut = useDeleteVehicle();
  const [compareOpen, setCompareOpen] = useState(false);
  const basePath = getRoleBasePath(role ?? null);

  // Hiển thị thông báo khi 401/403
  if (
    error &&
    typeof error === "object" &&
    error !== null &&
    (error as { response?: { status?: number } })?.response?.status === 401
  ) {
    message.error("🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
  }

  const actions = useMemo(() => {
    const arr: ReactElement[] = [];

    arr.push(
      <Button
        key="back"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
      >
        Quay lại
      </Button>
    );

    if (canAddVehicleBatch(role)) {
      arr.push(
        <Button
          key="add-batch"
          icon={<PlusOutlined />}
          onClick={() =>
            navigate(`${basePath}/${ROUTES.EVM_VEHICLE_BULK}?vehicleId=${id}`)
          }
        >
          Thêm lô xe
        </Button>
      );
    }

    if (canEditVehicle(role)) {
      arr.push(
        <Button
          key="edit"
          icon={<EditOutlined />}
          onClick={() =>
            navigate(
              `${basePath}/${ROUTES.EVM_VEHICLE_EDIT}`.replace(":id", id)
            )
          }
        >
          Chỉnh sửa
        </Button>
      );
      arr.push(
        <Popconfirm
          key="delete"
          title="Xóa mẫu xe?"
          okText="Xóa"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteMut.mutateAsync(id);
              message.success("Đã xóa");
              navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`);
            } catch (e: unknown) {
              message.error(
                (e as { message?: string })?.message || "Xóa thất bại"
              );
            }
          }}
        >
          <Button icon={<DeleteOutlined />} danger>
            Xóa
          </Button>
        </Popconfirm>
      );
    }

    if (canUpdatePrice(role)) {
      arr.push(
        <Button
          key="update-price"
          icon={<DollarOutlined />}
          onClick={() =>
            navigate(
              `${basePath}/${ROUTES.EVM_VEHICLE_PRICE_UPDATE}`.replace(
                ":id",
                id
              )
            )
          }
        >
          Cập nhật giá
        </Button>
      );
    }

    if (canViewDealerBatchesOnly(role)) {
      arr.push(
        <Button
          key="view-units"
          icon={<AppstoreOutlined />}
          onClick={() =>
            navigate(
              `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", id) +
                "?openUnits=1"
            )
          }
        >
          Xem lô xe
        </Button>
      );
    }

    if (isEvmStaff(role) || canUpdatePrice(role)) {
      arr.push(
        <Button
          key="compare"
          type="primary"
          icon={<ColumnWidthOutlined />}
          onClick={() => setCompareOpen(true)}
        >
          So sánh
        </Button>
      );
    }
    return arr;
  }, [role, id, navigate, basePath, deleteMut]);

  const cover = (
    <div className="w-full h-64 overflow-hidden flex items-center justify-center bg-white rounded-xl">
      <img
        src={vehicle?.imageUrl || "/images/vehicle-placeholder.png"}
        alt={vehicle?.name || "vehicle"}
        className="object-contain h-full"
      />
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Chi tiết mẫu xe</h1>
        <Space wrap>{actions}</Space>
      </div>

      <Card loading={isLoading} className="rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cover}
          <div>
            <h2 className="text-2xl font-semibold">{vehicle?.name}</h2>
            <div className="text-neutral-500">{vehicle?.brand}</div>

            <div className="flex flex-wrap gap-2 my-3">
              {vehicle?.rangePerCharge != null && (
                <Tag className="rounded-full">
                  Tầm hoạt động: {vehicle.rangePerCharge} km
                </Tag>
              )}
              {vehicle?.batteryCapacity != null && (
                <Tag className="rounded-full">
                  Pin: {vehicle.batteryCapacity} kWh
                </Tag>
              )}
              {vehicle?.power != null && (
                <Tag className="rounded-full">
                  Công suất: {vehicle.power} kW
                </Tag>
              )}
              {vehicle?.torque != null && (
                <Tag className="rounded-full">
                  Mô-men xoắn: {vehicle.torque} Nm
                </Tag>
              )}
              {vehicle?.seats != null && (
                <Tag className="rounded-full">Số chỗ: {vehicle.seats}</Tag>
              )}
            </div>

            <div className="font-bold text-2xl">
              {vehicle?.basePrice
                ? vehicle.basePrice.toLocaleString("vi-VN") + " ₫"
                : "Liên hệ"}
            </div>

            <Descriptions column={1} bordered className="mt-4 rounded-xl">
              <Descriptions.Item label="Mã xe">{vehicle?.id}</Descriptions.Item>
              <Descriptions.Item label="Hãng">
                {vehicle?.brand ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Pin">
                {vehicle?.batteryCapacity ?? "-"} kWh
              </Descriptions.Item>
              <Descriptions.Item label="Tầm hoạt động">
                {vehicle?.rangePerCharge ?? "-"} km
              </Descriptions.Item>
              <Descriptions.Item label="Công suất">
                {vehicle?.power ?? "-"} kW
              </Descriptions.Item>
              <Descriptions.Item label="Mô-men xoắn">
                {vehicle?.torque ?? "-"} Nm
              </Descriptions.Item>
              <Descriptions.Item label="Số chỗ">
                {vehicle?.seats ?? "-"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>

      {id && (
        <VehicleCompareModal
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          leftId={id}
        />
      )}
    </div>
  );
};
