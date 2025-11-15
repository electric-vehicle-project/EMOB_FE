// src/page/vehicle/VehicleListPage.tsx
/* EMOB-2025 - VehicleListPage (with Create Vehicle modal + DeleteConfirm + Filter) */
import { useMemo, useState, useEffect } from "react";
import {
  Empty,
  Input,
  Pagination,
  Row,
  Col,
  Spin,
  Modal,
  Form,
  Space,
  Select,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CarOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Role } from "../../model/Account";
import type { IVehicle } from "../../model/Vehicle";
import type { UploadFile } from "antd/es/upload";
import { getRoleBasePath } from "../../utils/roleGuard";
import { useGetVehicles, useCreateVehicle } from "../../service/vehicleService";
import { VehicleCard } from "../../components/organisms/vehicle/VehicleCard";
import { ROUTES } from "../../model/routePaths";
import { Button } from "../../components/atoms/Button";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { CardWrapper } from "../../components/template/CardWrapper";
import { VehicleForm } from "../../components/molecules/EVM/VehicleForm";
import { uploadFiles } from "../../utils/uploadFile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";

const { Option } = Select;

/** Small debounce hook (no external deps) */
function useDebounce<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export const VehicleListPage = () => {
  const navigate = useNavigate();

  type RootLike = { auth?: { user?: { role?: Role | null } } };
  const reduxRole = useSelector<RootLike, Role | null | undefined>(
    (s) => s.auth?.user?.role
  );
  const tokenRole = (useCurrentUser() as { role?: Role } | null)?.role;
  const role = (reduxRole ?? tokenRole ?? null) as Role | null;

  const allowCreate = role === "EVM_STAFF";
  const basePath = getRoleBasePath(role ?? null);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [q, setQ] = useState("");

  // ===== Filter state =====
  const [filterOpen, setFilterOpen] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const debouncedQ = useDebounce(q, 350);

  const { vehicles, metadata, isLoading } = useGetVehicles(
    {
      page: page - 1,
      size,
      keyword: debouncedQ.trim() || undefined,
      sortField: "createdAt",
      sortDir,
      type: types.length ? types : undefined,
    },
    {
      keepPreviousData: true,
      queryKey: [
        "get-vehicles",
        page,
        size,
        debouncedQ.trim(),
        sortDir,
        types.join(","),
      ],
    }
  );

  const items = useMemo(
    () => (Array.isArray(vehicles) ? (vehicles as IVehicle[]) : []),
    [vehicles]
  );

  const safeItems = useMemo(
    () =>
      items.filter(
        (v): v is IVehicle & { id: string } =>
          typeof v.id === "string" && v.id.length > 0
      ),
    [items]
  );

  const total = metadata?.totalElements ?? items.length ?? 0;

  // ===== Create modal state + hooks =====
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [form] = Form.useForm<IVehicle>();
  const queryClient = useQueryClient();
  const createVehicle = useCreateVehicle();

  const handleOpenCreate = () => {
    form.resetFields();
    setCreateOpen(true);
  };

  const handleCancelCreate = () => {
    const isDirty = form.isFieldsTouched();
    if (isDirty) {
      setConfirmCancelOpen(true);
    } else {
      setCreateOpen(false);
      form.resetFields();
    }
  };

  const handleCreate = async (values: IVehicle) => {
    try {
      const fileList =
        (values.images as unknown as UploadFile[] | undefined) ?? [];
      const rawFiles =
        fileList
          .map((f) =>
            f.originFileObj instanceof File ? f.originFileObj : null
          )
          .filter((f): f is NonNullable<typeof f> => f !== null) ?? [];

      const uploadedUrls =
        rawFiles.length > 0 ? await uploadFiles(rawFiles) : [];

      const payload: IVehicle = {
        ...values,
        images:
          uploadedUrls.length > 0
            ? uploadedUrls
            : ["https://placehold.co/300x200?text=Vehicle"],
      };

      await createVehicle.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["get-vehicles"] });

      toast.success("Thêm xe mới thành công!");
      form.resetFields();
      setCreateOpen(false);
    } catch (err: unknown) {
      console.error("❌ Lỗi khi tạo xe:", err);
      toast.error("Không thể thêm xe!");
    }
  };

  const searchBox = (
    <div className="w-full max-w-[340px] md:max-w-[420px]">
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Tìm theo tên, hãng..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        onPressEnter={() => setPage(1)}
        className="rounded-lg"
      />
    </div>
  );

  // ===== Filter dropdown content =====
  const FilterContent = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      {/* TYPE */}
      <div>
        <b className="text-gray-700">Loại xe</b>
        <Select
          mode="multiple"
          value={types}
          onChange={(v) => {
            setTypes((v as string[]) ?? []);
            setPage(1);
          }}
          allowClear
          className="w-full mt-2"
          placeholder="Chọn loại xe"
        >
          <Option value="SEDAN">SEDAN</Option>
          <Option value="SUV">SUV</Option>
          <Option value="HATCHBACK">HATCHBACK</Option>
          <Option value="TRUCK">TRUCK</Option>
          <Option value="MOTORBIKE">MOTORBIKE</Option>
        </Select>
      </div>

      {/* SORT DIR */}
      <div>
        <b className="text-gray-700">Thứ tự thời gian</b>
        <Select
          value={sortDir}
          onChange={(v) => {
            setSortDir(v as "asc" | "desc");
            setPage(1);
          }}
          className="w-full mt-2"
        >
          <Option value="desc">Mới nhất → Cũ hơn</Option>
          <Option value="asc">Cũ hơn → Mới nhất</Option>
        </Select>
      </div>
    </div>
  );

  const addButton = allowCreate ? (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      className="rounded-md !bg-[#627254] !border-[#627254] hover:!bg-[#76885B]"
      onClick={handleOpenCreate}
    >
      Thêm mẫu xe
    </Button>
  ) : (
    <div />
  );

  return (
    <CardWrapper
      title="Quản lí mẫu xe"
      subtitle="Danh sách toàn bộ các mẫu xe điện trong hệ thống"
      variant="dashboard"
    >
      {/* Header: Search + Filter + Add */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {searchBox}

          <Dropdown
            trigger={["click"]}
            open={filterOpen}
            onOpenChange={setFilterOpen}
            dropdownRender={() => <FilterContent />}
            placement="bottomRight"
          >
            <SlidersOutlined className="text-2xl cursor-pointer text-gray-600 hover:text-black" />
          </Dropdown>
        </div>

        {addButton}
      </div>

      <Spin spinning={isLoading}>
        {items.length === 0 ? (
          <Empty
            description={
              debouncedQ.trim()
                ? `Không tìm thấy kết quả cho "${debouncedQ.trim()}"`
                : "Không có dữ liệu"
            }
            className="bg-white rounded-xl py-10"
          />
        ) : (
          <>
            <div className="px-1 sm:px-2 md:px-3">
              <Row gutter={[20, 20]}>
                {safeItems.map((v) => (
                  <Col key={v.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <VehicleCard
                      vehicle={{
                        id: v.id,
                        name: `${v.brand ?? ""} ${v.model ?? ""}`.trim(),
                        brand: v.brand,
                        imageUrl:
                          Array.isArray(v.images) && v.images.length > 0
                            ? v.images[0]
                            : "https://placehold.co/300x200?text=No+Image",
                        basePrice:
                          typeof v.retailPrice === "number"
                            ? v.retailPrice
                            : undefined,
                        batteryCapacity: v.batteryKwh,
                        rangePerCharge: v.rangeKm,
                        power: v.powerKw,
                        type: v.type,
                      }}
                      onOpenDetail={(id) =>
                        navigate(
                          `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(
                            ":id",
                            id
                          ),
                          { state: { from: "list" } }
                        )
                      }
                    />
                  </Col>
                ))}
              </Row>
            </div>

            <div className="flex justify-center mt-8">
              <Pagination
                current={page}
                pageSize={size}
                total={total}
                showSizeChanger
                onChange={(p, ps) => {
                  setPage(p);
                  setSize(ps);
                }}
                showTotal={(t) => `${t} mẫu xe`}
                className="text-[#627254]"
              />
            </div>
          </>
        )}
      </Spin>

      {/* Modal tạo mẫu xe */}
      <Modal
        open={createOpen}
        onCancel={handleCancelCreate}
        footer={null}
        width={820}
        destroyOnClose
        title={
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CarOutlined className="text-[#627254]" />
              <span className="text-base font-semibold">Thêm xe điện mới</span>
            </div>
            <span className="text-xs text-gray-500">
              Nhập thông tin model xe, hình ảnh và thông số cơ bản để thêm vào
              hệ thống.
            </span>
          </div>
        }
      >
        <VehicleForm
          form={form}
          onFinish={handleCreate}
          canEditPrices={false}
        />

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          <Space>
            <Button
              onClick={handleCancelCreate}
              className="rounded-md"
              disabled={createVehicle.isPending}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createVehicle.isPending}
              className="!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] rounded-md"
            >
              Tạo xe
            </Button>
          </Space>
        </div>
      </Modal>

      {/* DeleteConfirm cho hủy tạo xe (mất dữ liệu form) */}
      <DeleteConfirm
        open={createOpen && confirmCancelOpen}
        onCancel={() => setConfirmCancelOpen(false)}
        onConfirm={() => {
          setConfirmCancelOpen(false);
          setCreateOpen(false);
          form.resetFields();
        }}
        title="Hủy tạo xe mới?"
        message="Các thông tin đã nhập sẽ bị mất. Bạn có chắc chắn muốn hủy?"
        okText="Hủy tạo"
        danger
      />
    </CardWrapper>
  );
};

export default VehicleListPage;
