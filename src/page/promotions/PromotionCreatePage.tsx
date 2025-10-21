import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message as antdMessage,
  Space,
  Spin,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";
import type { Role } from "../../utils/promotionPermissions";

import { usePromotionCreate } from "../../service/promotionService";
import { useGetDealers } from "../../service/dealerService";
import { useGetVehicles } from "../../service/vehicleService";

const { Title } = Typography;

interface PromotionFormValues {
  dealerId?: string[];
  electricVehiclesId: string[];
  name: string;
  description?: string;
}

export default function PromotionCreatePage() {
  const [form] = Form.useForm<PromotionFormValues>();
  const navigate = useNavigate();

  // ===== USER INFO & ROLE =====
  const user = useSelector((s: RootState) => s.user ?? {}) as Partial<{
    id: string;
    dealerId: string;
    role: Role;
  }>;

  const role = user.role ?? "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";
  const isAdmin = role === "ADMIN";

  const canFetchDealers = isEvmStaff || isAdmin;

  // ===== API HOOKS =====
  const { mutateAsync: createPromotion, isPending } = usePromotionCreate();
  const { data: dealersData, isLoading: loadingDealers } = useGetDealers({
    enabled: canFetchDealers, // ✅ chỉ gọi khi có quyền
  });
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: true, // luôn được phép gọi
  });

  // ===== STATE LOCAL =====
  const [dealerOptions, setDealerOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // ===== XỬ LÝ DỮ LIỆU TRẢ VỀ =====
  useEffect(() => {
    if (vehiclesData) {
      const vehicles =
        vehiclesData?.result?.data ??
        vehiclesData?.result ??
        vehiclesData ??
        [];
      setVehicleOptions(
        vehicles.map((v: { id: string; name: string }) => ({
          id: v.id,
          name: v.name,
        }))
      );
    }

    if (dealersData && canFetchDealers) {
      const dealers =
        dealersData?.result?.data ?? dealersData?.result ?? dealersData ?? [];
      setDealerOptions(
        dealers.map((d: { id: string; name: string }) => ({
          id: d.id,
          name: d.name,
        }))
      );
    }

    if (vehiclesData || (dealersData && canFetchDealers)) setLoading(false);
  }, [dealersData, vehiclesData, canFetchDealers]);

  // ===== KHỞI TẠO GIÁ TRỊ MẶC ĐỊNH CHO DEALER_STAFF =====
  useEffect(() => {
    if (isDealerStaff && user.dealerId) {
      form.setFieldsValue({ dealerId: [user.dealerId] });
    }
  }, [isDealerStaff, user.dealerId, form]);

  // ===== SUBMIT FORM =====
  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const payload = {
        dealerId: isDealerStaff ? [user.dealerId!] : values.dealerId ?? [],
        electricVehiclesId: values.electricVehiclesId ?? [],
        name: values.name.trim(),
        description: values.description?.trim() || "",
      };

      console.log("📦 Payload gửi BE:", payload);

      await createPromotion(payload);
      antdMessage.success("Tạo khuyến mãi thành công!");
      navigate(-1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Lỗi tạo khuyến mãi:", err.message);
      } else {
        console.error("❌ Lỗi tạo khuyến mãi:", err);
      }
      antdMessage.error("Tạo khuyến mãi thất bại!");
    }
  };

  // ===== LOADING =====
  if (loading || loadingDealers || loadingVehicles) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // ===== CHECK QUYỀN TRUY CẬP =====
  if (!isDealerStaff && !isEvmStaff && !isAdmin) {
    antdMessage.warning("Bạn không có quyền truy cập trang này!");
    navigate(-1);
    return null;
  }

  // ===== RENDER UI =====
  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 20 }}>
        <Button onClick={() => navigate(-1)}>⬅ Quay lại</Button>
        <Title level={4}>Tạo khuyến mãi mới</Title>
      </Space>

      <Form<PromotionFormValues>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* DEALER ID */}
        <Form.Item label="Áp dụng cho đại lý" name="dealerId">
          <Select
            mode="multiple"
            allowClear
            disabled={isDealerStaff} // ✅ staff không chọn được
            placeholder={
              isDealerStaff
                ? "Tự động gán dealerId của bạn"
                : "Bỏ trống nếu muốn tạo khuyến mãi toàn hệ thống (GLOBAL)"
            }
            options={dealerOptions.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Form.Item>

        {/* ELECTRIC VEHICLE IDS */}
        <Form.Item
          label="Xe điện áp dụng"
          name="electricVehiclesId"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất một xe điện" },
          ]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Chọn xe điện áp dụng"
            options={vehicleOptions.map((v) => ({
              label: v.name,
              value: v.id,
            }))}
          />
        </Form.Item>

        {/* NAME */}
        <Form.Item
          label="Tên khuyến mãi"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên khuyến mãi" }]}
        >
          <Input placeholder="Nhập tên khuyến mãi (ví dụ: Giảm giá 10%)" />
        </Form.Item>

        {/* DESCRIPTION */}
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea
            rows={3}
            placeholder="Mô tả chi tiết khuyến mãi"
            style={{ resize: "none", borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo khuyến mãi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
