// src/page/vehicle/VehicleDetailPage.tsx
/* EMOB-2025 - VehicleDetailPage */
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, Tag, Image, Dropdown, Menu } from "antd";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import type { Role } from "../../model/Account";
import type { IVehicle } from "../../model/Vehicle";
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
import VehicleUnitListModal from "../../components/organisms/vehicle/VehicleUnitListModal";
import VehicleEditModal from "../../components/organisms/vehicle/VehicleEditModal";
import VehiclePriceUpdateModal from "../../components/organisms/vehicle/VehiclePriceUpdateModal";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";
import {
  EditOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ColumnWidthOutlined,
  DeleteOutlined,
  PictureOutlined,
  EllipsisOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../model/routePaths";
import { Button } from "../../components/atoms/Button";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { CardWrapper } from "../../components/template/CardWrapper";
import { toast } from "react-toastify";
import VehicleBulkPage from "./VehicleBulkPage";

type Sel = { auth?: { user?: { role?: Role | null } } };

// ==== Điều hướng có nhớ nguồn ====
type NavState = {
  from?: "bulk" | "edit" | "list" | string;
  backTo?: string;
};

const formatSpecValue = (
  value?: string | number | null,
  unit?: string
): string => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "number") {
    const base = value.toLocaleString("vi-VN");
    return unit ? `${base} ${unit}` : base;
  }

  const base = String(value);
  return unit ? `${base} ${unit}` : base;
};

const SpecItem = ({
  label,
  value,
  unit,
}: {
  label: string;
  value?: string | number | null;
  unit?: string;
}) => (
  <div className="grid grid-cols-5 gap-3 py-2">
    <div className="col-span-2 text-sm text-neutral-500">{label}</div>
    <div className="col-span-3 font-medium">{formatSpecValue(value, unit)}</div>
  </div>
);

export const VehicleDetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  // ===== Local state luôn sync và cho phép cập nhật ngay sau khi edit =====
  const [viewVehicle, setViewVehicle] = useState<IVehicle | null>(null);

  useEffect(() => {
    if (vehicle) {
      setViewVehicle(vehicle as IVehicle);
    }
  }, [vehicle]);

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
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const [unitsOpen, setUnitsOpen] = useState(false);
  useEffect(() => {
    setUnitsOpen(searchParams.get("openUnits") === "1");
  }, [searchParams]);

  const fromRef = useRef<NavState["from"] | null>(null);
  const backToRef = useRef<string | null>(null);
  useEffect(() => {
    const st = (location.state as NavState | null) ?? null;
    if (st?.from) fromRef.current = st.from;
    if (st?.backTo) backToRef.current = st.backTo;
  }, [location.state]);

  const handleOpenUnits = useCallback(() => {
    const next = new URLSearchParams(location.search);
    next.set("openUnits", "1");
    setUnitsOpen(true);
    navigate(
      { search: `?${next.toString()}` },
      { replace: true, state: location.state }
    );
  }, [location.search, navigate, location.state]);

  const handleCloseUnits = useCallback(() => {
    const next = new URLSearchParams(location.search);
    next.delete("openUnits");
    setUnitsOpen(false);
    navigate(
      { search: next.toString() ? `?${next.toString()}` : "" },
      { replace: true, state: location.state }
    );
  }, [location.search, navigate, location.state]);

  const handleBack = useCallback(() => {
    const fromState = fromRef.current;
    const backTo = backToRef.current;

    if (fromState === "bulk" && backTo) {
      navigate(backTo, { replace: true });
      return;
    }

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

  const priced = hasVehiclePriced(viewVehicle ?? undefined);

  // ===== Gallery state =====
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rawImages: string[] = Array.isArray(viewVehicle?.images)
    ? (viewVehicle?.images as string[])
    : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [rawImages.length]);

  const safeImages =
    rawImages.length > 0 ? rawImages : ["/images/vehicle-placeholder.png"];
  const hasMultiple = safeImages.length > 1;

  const name = `${viewVehicle?.brand ?? ""} ${viewVehicle?.model ?? ""}`.trim();
  const mainImage =
    safeImages[activeIndex] || "/images/vehicle-placeholder.png";

  // ===== Menu 3 chấm cho các thao tác (trừ Quay lại) =====
  const menu = (
    <Menu>
      {canEditVehicle(role) && (
        <Menu.Item
          key="edit"
          icon={<EditOutlined />}
          disabled={isLoading || !viewVehicle}
          onClick={() => setEditOpen(true)}
        >
          Chỉnh sửa thông tin
        </Menu.Item>
      )}

      {canUpdatePrice(role) && (
        <Menu.Item
          key="update-price"
          icon={<DollarOutlined />}
          disabled={!viewVehicle}
          onClick={() => setPriceOpen(true)}
        >
          Cập nhật giá
        </Menu.Item>
      )}

      {canBulkCreateUnits(role) && (
        <Menu.Item
          key="add-batch"
          icon={<PlusOutlined />}
          disabled={!priced}
          onClick={() => setBulkOpen(true)}
        >
          Nhập kho
        </Menu.Item>
      )}

      {canViewUnits() && (
        <Menu.Item
          key="view-units"
          icon={<AppstoreOutlined />}
          onClick={handleOpenUnits}
        >
          Xem lô xe
        </Menu.Item>
      )}

      {canCompareVehicles() && (
        <Menu.Item
          key="compare"
          icon={<ColumnWidthOutlined />}
          onClick={() => setCompareOpen(true)}
        >
          So sánh mẫu xe
        </Menu.Item>
      )}

      {canDeleteVehicle(role) && (
        <>
          <Menu.Divider />
          <Menu.Item
            key="delete"
            icon={<DeleteOutlined />}
            danger
            disabled={deleting || !viewVehicle}
            onClick={() => setDeleteOpen(true)}
          >
            Xóa mẫu xe
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <>
      <CardWrapper
        title="Chi tiết mẫu xe"
        subtitle="Thông tin tổng quan & thông số kỹ thuật"
        variant="dashboard"
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="rounded-full border border-[#d3d7c3] bg-white px-3 h-9 text-[#414d38] hover:bg-[#f5f7f0] hover:border-[#c4c8b0]"
          >
            Quay lại
          </Button>

          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button className="rounded-full bg-[#f5f7f0] border border-[#d3d7c3] flex items-center gap-2 px-3 h-9 text-[#414d38] transition-colors duration-150 hover:bg-[#ecefe2] hover:border-[#c4c8b0]">
              <span className="hidden sm:inline text-xs font-medium tracking-wide">
                Thao tác
              </span>
              <EllipsisOutlined className="text-lg" />
            </Button>
          </Dropdown>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ẢNH & GALLERY */}
          <Card loading={isLoading} className="rounded-2xl lg:col-span-5">
            <Image.PreviewGroup
              items={safeImages as string[]}
              preview={{
                visible: previewOpen,
                current: activeIndex,
                onVisibleChange: (v) => setPreviewOpen(v),
                onChange: (idx) => setActiveIndex(idx),
                toolbarRender: (_node, info) => {
                  const { icons, actions } = info;
                  const { zoomInIcon, zoomOutIcon, prevIcon, nextIcon } = icons;
                  const { onZoomIn, onZoomOut, onActive } = actions;
                  return (
                    <div className="ant-image-preview-operations">
                      {prevIcon && (
                        <div
                          className="ant-image-preview-operations-operation"
                          onClick={() => onActive?.(-1)}
                        >
                          {prevIcon}
                        </div>
                      )}
                      {nextIcon && (
                        <div
                          className="ant-image-preview-operations-operation"
                          onClick={() => onActive?.(1)}
                        >
                          {nextIcon}
                        </div>
                      )}
                      <div
                        className="ant-image-preview-operations-operation"
                        onClick={onZoomIn}
                      >
                        {zoomInIcon}
                      </div>
                      <div
                        className="ant-image-preview-operations-operation"
                        onClick={onZoomOut}
                      >
                        {zoomOutIcon}
                      </div>
                    </div>
                  );
                },
              }}
            />

            <div
              className="group w-full aspect-[4/3] overflow-hidden flex items-center justify-center bg-white rounded-xl border cursor-zoom-in relative"
              onClick={() => {
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

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/40 text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setActiveIndex((prev) =>
                        prev === 0 ? safeImages.length - 1 : prev - 1
                      );
                    }}
                    aria-label="Ảnh trước"
                  >
                    <LeftOutlined />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/40 text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setActiveIndex((prev) =>
                        prev === safeImages.length - 1 ? 0 : prev + 1
                      );
                    }}
                    aria-label="Ảnh tiếp theo"
                  >
                    <RightOutlined />
                  </button>
                </>
              )}

              <div className="pointer-events-none absolute bottom-2 right-2 hidden group-hover:flex items-center gap-1 rounded-md bg-black/50 text-white text-xs px-2 py-1">
                <PictureOutlined />
                Nhấn để phóng to
              </div>
            </div>

            {safeImages.length > 1 && (
              <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
                {safeImages.slice(0, 6).map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`h-16 rounded-xl border overflow-hidden bg-white focus:outline-none focus:ring-2 focus:ring-[#627254] ${
                      i === activeIndex
                        ? "ring-2 ring-[#627254]"
                        : "border-gray-300"
                    }`}
                    onClick={() => setActiveIndex(i)}
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

                {safeImages.length > 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex(0);
                      setPreviewOpen(true);
                    }}
                    className="h-16 rounded-xl border border-dashed bg-gray-50 hover:bg-gray-100 transition text-sm text-gray-600"
                    title="Xem tất cả ảnh"
                  >
                    +{safeImages.length - 6} ảnh
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* THÔNG TIN CHI TIẾT */}
          <Card loading={isLoading} className="rounded-2xl lg:col-span-7">
            {!isLoading && viewVehicle && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#414d38]">
                      {name || viewVehicle.id}
                    </h2>
                    {viewVehicle.brand && (
                      <div className="text-neutral-500 mt-0.5">
                        {viewVehicle.brand}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {viewVehicle.type && (
                        <Tag className="rounded-full">{viewVehicle.type}</Tag>
                      )}
                      {typeof viewVehicle.rangeKm === "number" && (
                        <Tag className="rounded-full">
                          Tầm: {viewVehicle.rangeKm.toLocaleString("vi-VN")} km
                        </Tag>
                      )}
                      {typeof viewVehicle.batteryKwh === "number" && (
                        <Tag className="rounded-full">
                          Pin: {viewVehicle.batteryKwh.toLocaleString("vi-VN")}{" "}
                          kWh
                        </Tag>
                      )}
                      {typeof viewVehicle.powerKw === "number" && (
                        <Tag className="rounded-full">
                          Công suất:{" "}
                          {viewVehicle.powerKw.toLocaleString("vi-VN")} kW
                        </Tag>
                      )}
                    </div>

                    {isEvmStaff(role) && !priced && (
                      <div className="mt-4">
                        <Tag color="orange">
                          Mẫu xe chưa có giá. Vui lòng nhờ Admin cập nhật trước
                          khi nhập lô.
                        </Tag>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {/* Giá nhập */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border text-sm font-semibold">
                      Giá nhập:
                      <span className="text-[#414d38]">
                        {typeof viewVehicle.importPrice === "number" &&
                        viewVehicle.importPrice > 0
                          ? `${viewVehicle.importPrice.toLocaleString(
                              "vi-VN"
                            )} VNĐ`
                          : "Chưa cập nhật"}
                      </span>
                    </div>

                    {/* Giá bán lẻ */}
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border text-sm font-semibold">
                      Giá bán lẻ:
                      <span className="text-[#414d38]">
                        {typeof viewVehicle.retailPrice === "number" &&
                        viewVehicle.retailPrice > 0
                          ? `${viewVehicle.retailPrice.toLocaleString(
                              "vi-VN"
                            )} VNĐ`
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <h3 className="text-base font-semibold mb-2">
                    Thông số kỹ thuật
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <SpecItem label="Hãng" value={viewVehicle.brand} />
                    <SpecItem label="Mẫu" value={viewVehicle.model} />
                    <SpecItem label="Loại" value={viewVehicle.type} />
                    <SpecItem
                      label="Pin"
                      value={viewVehicle.batteryKwh}
                      unit="kWh"
                    />
                    <SpecItem
                      label="Tầm hoạt động"
                      value={viewVehicle.rangeKm}
                      unit="km"
                    />
                    <SpecItem
                      label="Công suất"
                      value={viewVehicle.powerKw}
                      unit="kW"
                    />
                    <SpecItem
                      label="Tốc độ tối đa"
                      value={viewVehicle.topSpeedKmh}
                      unit="km/h"
                    />
                    <SpecItem
                      label="Khối lượng"
                      value={viewVehicle.weightKg}
                      unit="kg"
                    />
                    <SpecItem
                      label="Thời gian sạc"
                      value={viewVehicle.chargeTimeHr}
                      unit="giờ"
                    />
                    <SpecItem label="Ngày tạo" value={viewVehicle.createdAt} />
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

        {id && (
          <VehicleEditModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            vehicleId={id}
            vehicle={viewVehicle ?? null}
            loading={isLoading}
            onUpdated={(next) => setViewVehicle(next)}
          />
        )}

        {id && (
          <VehiclePriceUpdateModal
            open={priceOpen}
            onClose={() => setPriceOpen(false)}
            vehicleId={id}
            vehicle={viewVehicle}
            onUpdated={(next) => setViewVehicle(next)}
          />
        )}

        {id && (
          <DeleteConfirm
            open={deleteOpen}
            onCancel={() => setDeleteOpen(false)}
            onConfirm={async () => {
              try {
                await deleteVehicle(id);
                toast.success("Đã xóa mẫu xe.");
                setDeleteOpen(false);
                navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`, {
                  replace: true,
                });
              } catch {
                toast.error("Xóa không thành công.");
              }
            }}
            title="Xóa mẫu xe?"
            message="Hành động này không thể hoàn tác."
            okText="Xóa"
            danger
          />
        )}
      </CardWrapper>
      <VehicleBulkPage
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        vehicleId={id ?? undefined}
      />
    </>
  );
};

export default VehicleDetailPage;
