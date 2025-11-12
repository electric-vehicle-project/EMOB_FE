/* EMOB-2025 - VehicleDetailPage */
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Card, Tag, Space, Tooltip, message, Popconfirm, Image } from "antd";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactElement } from "react";
import type { Role } from "../../model/Account";
import {
  canBulkCreateUnits,
  canCompareVehicles,
  canEditVehicle,
  canUpdatePrice,
  canViewUnits,
  getRoleBasePath,
  hasVehiclePriced,
  isEvmStaff,
  canDeleteVehicle,
  normalizeRole,
} from "../../utils/roleGuard";
import {
  useGetVehicleById,
  useDeleteVehicle,
} from "../../service/vehicleService";
import { VehicleCompareModal } from "../../components/organisms/vehicle/VehicleCompareModal";
import {
  EditOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ColumnWidthOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../model/routePaths";
import { Button } from "../../components/atoms/Button";
import { useCurrentUser } from "../../utils/getCurrentUser";
import VehicleUnitListModal from "../../components/organisms/vehicle/VehicleUnitListModal";
import { CardWrapper } from "../../components/template/CardWrapper";
import { toast } from "react-toastify";

type Sel = { auth?: { user?: { role?: Role | null } } };

const SpecItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="grid grid-cols-5 gap-3 py-2">
    <div className="col-span-2 text-sm text-neutral-500">{label}</div>
    <div className="col-span-3 font-medium">{value ?? "—"}</div>
  </div>
);

export const VehicleDetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Role lấy chắc chắn
  const reduxRole = useSelector((s: Sel) => s.auth?.user?.role);
  const tokenRole = (useCurrentUser() as { role?: Role } | null)?.role ?? null;
  const urlSeg =
    typeof window !== "undefined"
      ? (window.location.pathname.split("/")[1] || "").toUpperCase()
      : "";
  const urlRoleGuess =
    urlSeg === "ADMIN"
      ? "ADMIN"
      : urlSeg === "EVM_STAFF"
      ? "EVM_STAFF"
      : urlSeg === "MANAGER"
      ? "MANAGER"
      : null;

  const role = normalizeRole(reduxRole ?? tokenRole ?? urlRoleGuess);
  const basePath = getRoleBasePath(role);

  const { vehicle, isLoading, error } = useGetVehicleById(id, {
    enabled: !!id,
  });

  useEffect(() => {
    const http401 =
      error &&
      typeof error === "object" &&
      (error as { response?: { status?: number } })?.response?.status === 401;
    if (http401)
      toast.error("🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
  }, [error]);

  const { mutateAsync: deleteVehicle, isPending: deleting } =
    useDeleteVehicle();

  const [compareOpen, setCompareOpen] = useState(false);

  // =========================
  // Xem lô xe bằng query param
  // =========================
  const [searchParams] = useSearchParams();
  const [unitsOpen, setUnitsOpen] = useState(false);
  useEffect(() => {
    setUnitsOpen(searchParams.get("openUnits") === "1");
  }, [searchParams]);

  // ⚠️ Cache nguồn điều hướng (list/edit) để không bị mất khi đổi query
  const fromRef = useRef<"list" | "edit" | null>(null);
  useEffect(() => {
    const from =
      typeof location.state === "object" &&
      (location.state as Record<string, unknown>)?.from;
    if (from === "list" || from === "edit") fromRef.current = from;
  }, [location.state]);

  // Mở modal: thêm openUnits=1 nhưng GIỮ state hiện tại
  const handleOpenUnits = useCallback(() => {
    const next = new URLSearchParams(location.search);
    next.set("openUnits", "1");
    setUnitsOpen(true);
    navigate(
      { search: `?${next.toString()}` },
      { replace: true, state: location.state }
    );
  }, [location.search, navigate, location.state]);

  // Đóng modal: xóa openUnits và GIỮ state
  const handleCloseUnits = useCallback(() => {
    const next = new URLSearchParams(location.search);
    next.delete("openUnits");
    setUnitsOpen(false);
    navigate(
      { search: next.toString() ? `?${next.toString()}` : "" },
      { replace: true, state: location.state }
    );
  }, [location.search, navigate, location.state]);

  const priced = hasVehiclePriced(vehicle);

  // Back button logic (ổn định dù đã mở/đóng modal)
  const handleBack = useCallback(() => {
    const fromState = fromRef.current;
    if (fromState === "edit" || fromState === "list") {
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`, { replace: true });
      return;
    }
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`, { replace: true });
    }
  }, [navigate, basePath]);

  const actions = useMemo(() => {
    const arr: ReactElement[] = [];
    arr.push(
      <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBack}>
        Quay lại
      </Button>
    );

    if (canEditVehicle(role)) {
      arr.push(
        <Button
          key="edit"
          icon={<EditOutlined />}
          onClick={() =>
            navigate(
              `${basePath}/${ROUTES.EVM_VEHICLE_EDIT}`.replace(":id", id),
              { state: { from: "detail" } }
            )
          }
          className="rounded-md"
        >
          Chỉnh sửa
        </Button>
      );
    }

    if (canDeleteVehicle(role)) {
      arr.push(
        <Popconfirm
          key="delete"
          title="Xóa mẫu xe?"
          description="Hành động này không thể hoàn tác."
          okText="Xóa"
          okButtonProps={{ danger: true, loading: deleting }}
          cancelText="Hủy"
          onConfirm={async () => {
            try {
              await deleteVehicle(id);
              toast.success("Đã xóa mẫu xe.");
              navigate(-1);
            } catch {
              toast.error("Xóa không thành công.");
            }
          }}
        >
          <Button icon={<DeleteOutlined />} danger className="rounded-md">
            Xóa
          </Button>
        </Popconfirm>
      );
    }

    if (canBulkCreateUnits(role)) {
      const btn = (
        <Button
          key="add-batch"
          icon={<PlusOutlined />}
          disabled={!priced}
          onClick={() =>
            navigate(`${basePath}/${ROUTES.EVM_VEHICLE_BULK}?vehicleId=${id}`, {
              state: { from: "detail" },
            })
          }
          className="rounded-md"
        >
          Thêm lô xe
        </Button>
      );
      arr.push(
        priced ? (
          btn
        ) : (
          <Tooltip
            key="add-batch-tip"
            title="Mẫu xe chưa có giá. Vui lòng nhờ Admin cập nhật."
          >
            <span>{btn}</span>
          </Tooltip>
        )
      );
    }

    if (canUpdatePrice(role)) {
      arr.push(
        <Button
          key="update-price"
          type="primary"
          icon={<DollarOutlined />}
          onClick={() =>
            navigate(
              `${basePath}/${ROUTES.EVM_VEHICLE_PRICE_UPDATE}`.replace(
                ":id",
                id
              )
            )
          }
          className="rounded-md !bg-[#627254] !border-[#627254] hover:!bg-[#76885B]"
        >
          Cập nhật giá
        </Button>
      );
    }

    if (canViewUnits()) {
      arr.push(
        <Button
          key="view-units"
          icon={<AppstoreOutlined />}
          onClick={handleOpenUnits}
          className="rounded-md"
        >
          Xem lô xe
        </Button>
      );
    }

    if (canCompareVehicles()) {
      arr.push(
        <Button
          key="compare"
          type="primary"
          icon={<ColumnWidthOutlined />}
          onClick={() => setCompareOpen(true)}
          className="rounded-md !bg-[#627254] !border-[#627254] hover:!bg-[#76885B]"
        >
          So sánh
        </Button>
      );
    }

    return arr;
  }, [
    role,
    id,
    basePath,
    navigate,
    priced,
    deleting,
    deleteVehicle,
    handleBack,
    handleOpenUnits,
  ]);

  const name = `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`.trim();
  const images: string[] = Array.isArray(vehicle?.images)
    ? vehicle!.images
    : [];
  const mainImage = images[0] || "/images/vehicle-placeholder.png";

  // --- Lightbox preview (Antd Image.PreviewGroup) ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  return (
    <CardWrapper
      title="Chi tiết mẫu xe"
      subtitle="Thông tin tổng quan & thông số kỹ thuật"
      variant="dashboard"
    >
      <div className="flex items-center justify-between -mt-2">
        <div />
        <Space wrap>{actions}</Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ====== ẢNH & GALLERY ====== */}
        <Card loading={isLoading} className="rounded-2xl lg:col-span-5">
          {/* Lightbox viewer (ẩn, điều khiển qua state) */}
          <Image.PreviewGroup
            items={(images.length ? images : [mainImage]) as string[]}
            preview={{
              visible: previewOpen,
              current: previewIndex,
              onVisibleChange: (v) => setPreviewOpen(v),
              onChange: (idx) => setPreviewIndex(idx),
            }}
          />

          {/* Ảnh chính */}
          <div
            className="group w-full aspect-[4/3] overflow-hidden flex items-center justify-center bg-white rounded-xl border cursor-zoom-in"
            onClick={() => {
              setPreviewIndex(0);
              setPreviewOpen(true);
            }}
          >
            <img
              src={mainImage}
              alt={name || "vehicle"}
              className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/images/vehicle-placeholder.png";
              }}
            />
            <div className="pointer-events-none absolute bottom-2 right-2 hidden group-hover:flex items-center gap-1 rounded-md bg-black/50 text-white text-xs px-2 py-1">
              <PictureOutlined />
              Nhấn để phóng to
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
              {images.slice(0, 6).map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className={`h-16 rounded-xl border overflow-hidden bg-white focus:outline-none focus:ring-2 focus:ring-[#627254] ${
                    i === previewIndex
                      ? "ring-2 ring-[#627254]"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setPreviewIndex(i);
                    setPreviewOpen(true);
                  }}
                  title={`Xem ảnh ${i + 1}`}
                >
                  <img
                    src={url}
                    alt={`thumb-${i}`}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/images/vehicle-placeholder.png";
                    }}
                  />
                </button>
              ))}

              {images.length > 6 && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewIndex(0);
                    setPreviewOpen(true);
                  }}
                  className="h-16 rounded-xl border border-dashed bg-gray-50 hover:bg-gray-100 transition text-sm text-gray-600"
                  title="Xem tất cả ảnh"
                >
                  +{images.length - 6} ảnh
                </button>
              )}
            </div>
          )}
        </Card>

        {/* ====== THÔNG TIN CHI TIẾT ====== */}
        <Card loading={isLoading} className="rounded-2xl lg:col-span-7">
          {!isLoading && vehicle && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[#414d38]">
                    {name || vehicle.id}
                  </h2>
                  {vehicle.brand && (
                    <div className="text-neutral-500 mt-0.5">
                      {vehicle.brand}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {vehicle.type && (
                      <Tag className="rounded-full">{vehicle.type}</Tag>
                    )}
                    {typeof vehicle.rangeKm === "number" && (
                      <Tag className="rounded-full">
                        Tầm: {vehicle.rangeKm} km
                      </Tag>
                    )}
                    {typeof vehicle.batteryKwh === "number" && (
                      <Tag className="rounded-full">
                        Pin: {vehicle.batteryKwh} kWh
                      </Tag>
                    )}
                    {typeof vehicle.powerKw === "number" && (
                      <Tag className="rounded-full">
                        Công suất: {vehicle.powerKw} kW
                      </Tag>
                    )}
                  </div>

                  {isEvmStaff(role) && !priced && (
                    <Tag color="orange" className="mt-3">
                      Mẫu xe chưa có giá. Vui lòng nhờ Admin cập nhật trước khi
                      nhập lô.
                    </Tag>
                  )}
                </div>

                {priced && (
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border text-sm font-semibold">
                      Giá nhập:
                      <span className="text-[#414d38]">
                        {vehicle.importPrice?.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border text-sm font-semibold">
                      Giá bán lẻ:
                      <span className="text-[#414d38]">
                        {vehicle.retailPrice?.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-base font-semibold mb-2">
                  Thông số kỹ thuật
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <SpecItem label="Hãng" value={vehicle.brand} />
                  <SpecItem label="Mẫu" value={vehicle.model} />
                  <SpecItem label="Loại" value={vehicle.type} />
                  <SpecItem label="Pin (kWh)" value={vehicle.batteryKwh} />
                  <SpecItem
                    label="Tầm hoạt động (km)"
                    value={vehicle.rangeKm}
                  />
                  <SpecItem label="Công suất (kW)" value={vehicle.powerKw} />
                  <SpecItem
                    label="Tốc độ tối đa (km/h)"
                    value={vehicle.topSpeedKmh}
                  />
                  <SpecItem label="Khối lượng (kg)" value={vehicle.weightKg} />
                  <SpecItem
                    label="Thời gian sạc (giờ)"
                    value={vehicle.chargeTimeHr}
                  />
                  <SpecItem label="Ngày tạo" value={vehicle.createdAt} />
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {id && (
        <VehicleCompareModal
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          leftId={id}
        />
      )}

      {id && (
        <VehicleUnitListModal
          open={unitsOpen}
          onClose={handleCloseUnits}
          vehicleId={id}
        />
      )}
    </CardWrapper>
  );
};

export default VehicleDetailPage;
