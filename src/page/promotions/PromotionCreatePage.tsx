import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Space,
  Spin,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";
import type { Role } from "../../utils/promotionPermissions";

import { usePromotionCreate } from "../../service/promotionService";
import { getAllDealers } from "../../service/dealerService";
import { getAllElectricVehicles } from "../../service/electricVehicleService";

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

  const user = useSelector((s: RootState) => s.user ?? {}) as Partial<{
    id: string;
    dealerId: string;
    role: Role;
  }>;

  const role = user.role ?? "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";

  const { mutateAsync: createPromotion, isPending } = usePromotionCreate();

  const [dealerOptions, setDealerOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // ===== Fetch danh sách dealer & vehicle =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealers, vehicles] = await Promise.all([
          getAllDealers(),
          getAllElectricVehicles(),
        ]);
        if (Array.isArray(dealers)) setDealerOptions(dealers);
        if (Array.isArray(vehicles)) setVehicleOptions(vehicles);
      } catch (err) {
        console.error("Error fetching select data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== Khởi tạo giá trị mặc định cho DEALER_STAFF =====
  useEffect(() => {
    if (isDealerStaff && user.dealerId) {
      form.setFieldsValue({ dealerId: [user.dealerId] });
    }
  }, [isDealerStaff, user.dealerId, form]);

  // ===== Submit form =====
  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const payload = {
        dealerId: isDealerStaff ? [user.dealerId!] : values.dealerId ?? [],
        electricVehiclesId: values.electricVehiclesId,
        name: values.name.trim(),
        description: values.description?.trim() || "",
      };

      await createPromotion(payload);
      message.success("Tạo khuyến mãi thành công!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      message.error("Tạo khuyến mãi thất bại!");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // ===== Nếu không phải DEALER_STAFF hoặc EVM_STAFF =====
  if (!isDealerStaff && !isEvmStaff) {
    message.warning("Bạn không có quyền truy cập trang này!");
    navigate(-1);
    return null;
  }

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
            disabled={isDealerStaff}
            placeholder={
              isDealerStaff
                ? "Tự động gán dealerId của bạn"
                : "Bỏ trống nếu muốn tạo khuyến mãi toàn hệ thống (GLOBAL)"
            }
            options={dealerOptions.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Form.Item>

        {/* ELECTRIC VEHICLE ID */}
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
