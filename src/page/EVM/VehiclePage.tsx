import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import { PlusOutlined, InboxOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import CardWrapper from "../../components/template/CardWrapper";
import { VehicleList } from "../../components/organisms/EVM/VehicleList";
import { VehicleUnitListModal } from "./VehicleUnitListModal";
import {
  useCreateVehicle,
  useUploadVehicleImages,
} from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";

type CreateForm = {
  brand: string;
  model: string;
  type: "SEDAN" | "SUV" | "HATCHBACK" | "TRUCK" | "MOTORBIKE";
  batteryKwh?: number;
  rangeKm?: number;
  chargeTimeHr?: number;
  powerKw?: number;
  weightKg?: number;
  importPrice?: number;
  retailPrice?: number;
  images?: { originFileObj?: File }[];
};

const TYPE_OPTIONS = [
  { label: "Sedan", value: "SEDAN" },
  { label: "SUV", value: "SUV" },
  { label: "Hatchback", value: "HATCHBACK" },
  { label: "Xe tải", value: "TRUCK" },
  { label: "Xe máy", value: "MOTORBIKE" },
];

const UploadDragger = Upload.Dragger;
const labelBold: React.CSSProperties = { fontWeight: 600 };

export default function VehiclePage() {
  const [open, setOpen] = useState(false);
  const [openUnits, setOpenUnits] = useState(false);
  const [unitsVehicleId, setUnitsVehicleId] = useState<string>("");
  const [form] = Form.useForm<CreateForm>();
  const qc = useQueryClient();

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";
  const IS_ADMIN = role === "ADMIN";
  const IS_EVM = role === "EVM_STAFF";
  const canCreate = IS_ADMIN || IS_EVM;

  const createVehicle = useCreateVehicle();
  const uploadImages = useUploadVehicleImages();

  const beforeUpload = () => false;
  const normalizeUpload = (_: unknown, fileList: { originFileObj?: File }[]) =>
    fileList;

  const onCreate = async (values: CreateForm) => {
    try {
      let imageUrls: string[] = [];
      const files: File[] = (values.images ?? [])
        .map((f) => f.originFileObj)
        .filter((file): file is File => file instanceof File);

      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const upRes = await uploadImages.mutateAsync(fd);
        imageUrls = upRes?.data?.result || upRes?.result || upRes || [];
      }

      const payloadBase = {
        brand: values.brand?.trim(),
        model: values.model?.trim(),
        type: values.type,
        batteryKwh: values.batteryKwh ?? null,
        rangeKm: values.rangeKm ?? null,
        chargeTimeHr: values.chargeTimeHr ?? null,
        powerKw: values.powerKw ?? null,
        weightKg: values.weightKg ?? null,
        images:
          imageUrls.length > 0
            ? imageUrls
            : ["https://placehold.co/600x400?text=Vehicle"], // ✅
      };

      const payload = IS_ADMIN
        ? {
            ...payloadBase,
            importPrice: values.importPrice ?? null,
            retailPrice: values.retailPrice ?? null,
          }
        : payloadBase;

      await createVehicle.mutateAsync(payload);
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
      message.success("✅ Tạo xe mới thành công");
      form.resetFields();
      setOpen(false);
    } catch (e) {
      console.error(e);
      message.error("❌ Tạo xe thất bại");
    }
  };

  return (
    <CardWrapper
      title="Quản lý xe"
      subtitle="Tạo mới, tìm kiếm và xem chi tiết danh mục xe."
      variant="dashboard"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Danh mục xe hiện có • Có thể lọc và xem chi tiết.
        </div>
        {canCreate && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-95 transition"
            style={{ background: "#627254" }}
          >
            <PlusOutlined />
            Thêm xe mới
          </button>
        )}
      </div>

      {/* ✅ Truyền callback để mở modal lô xe */}
      <VehicleList
        onOpenUnits={(id) => {
          setUnitsVehicleId(id);
          setOpenUnits(true);
        }}
      />

      {/* Modal lô xe */}
      <VehicleUnitListModal
        open={openUnits}
        onClose={() => setOpenUnits(false)}
        vehicleId={unitsVehicleId}
      />

      {/* Modal tạo xe */}
      <Modal
        title={
          <div className="text-lg font-bold text-[#2f3e2f]">
            Thêm xe mới {IS_ADMIN ? "" : "(không nhập giá)"}
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={820}
        destroyOnHidden
        maskClosable={false}
        styles={{
          content: { borderRadius: 16, paddingTop: 12, paddingBottom: 10 },
        }}
      >
        <Form<CreateForm>
          form={form}
          layout="vertical"
          onFinish={onCreate}
          initialValues={{ type: "SEDAN" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={labelBold}>Hãng xe (Brand)</span>}
                name="brand"
                rules={[{ required: true, message: "Vui lòng nhập hãng xe" }]}
              >
                <Input placeholder="VD: EMOB" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={labelBold}>Mẫu xe (Model)</span>}
                name="model"
                rules={[{ required: true, message: "Vui lòng nhập mẫu xe" }]}
              >
                <Input placeholder="VD: X1 Pro" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={labelBold}>Loại xe</span>}
                name="type"
                rules={[{ required: true, message: "Chọn loại xe" }]}
              >
                <Select
                  options={TYPE_OPTIONS}
                  placeholder="Chọn loại"
                  showSearch
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-3" />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Dung lượng pin (kWh)" name="batteryKwh">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tầm hoạt động (km)" name="rangeKm">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Thời gian sạc (giờ)" name="chargeTimeHr">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Công suất (kW)" name="powerKw">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Khối lượng (kg)" name="weightKg">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            {IS_ADMIN && (
              <Col span={12}>
                <Form.Item
                  label="Giá nhập (VNĐ)"
                  name="importPrice"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá nhập" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
          {IS_ADMIN && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Giá bán lẻ (VNĐ)"
                  name="retailPrice"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá bán lẻ" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            label={<span style={labelBold}>Hình ảnh</span>}
            name="images"
            valuePropName="fileList"
            getValueFromEvent={normalizeUpload}
          >
            <UploadDragger
              accept="image/*"
              multiple
              beforeUpload={beforeUpload}
              listType="picture"
              maxCount={6}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo & thả hoặc bấm để chọn ảnh</p>
              <p className="ant-upload-hint">
                Hỗ trợ tối đa 6 ảnh (không tự upload).
              </p>
            </UploadDragger>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setOpen(false)}
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={() => form.submit()}
              type="button"
              disabled={createVehicle.isPending || uploadImages.isPending}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: "#627254" }}
            >
              Tạo xe
            </button>
          </div>
        </Form>
      </Modal>
    </CardWrapper>
  );
}
