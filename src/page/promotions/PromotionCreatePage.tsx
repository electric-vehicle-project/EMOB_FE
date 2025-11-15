import { useEffect, useState } from "react";
import { Form, Input, Button, Select, Space, Spin, Typography } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { Role } from "../../utils/promotionPermissions";
import { usePromotionCreate } from "../../service/promotionService";
import { useGetVehicles } from "../../service/vehicleService";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../utils/mapToSelectOptions";
import { useDealersQuery } from "../../service/dealerService";
import { toast } from "react-toastify";
import { CardWrapper } from "../../components/template/CardWrapper";

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

  // USER INFO
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

  // API HOOKS
  const { mutateAsync: createPromotion, isPending } = usePromotionCreate();
  const { data: dealersData, isLoading: loadingDealers } = useDealersQuery(
    0,
    1000,
    "",
    "createdAt",
    "desc",
    undefined,
    canFetchDealers
  );

  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: true,
  });

  const [dealerOptions, setDealerOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // MAP API → SELECT
  useEffect(() => {
    setVehicleOptions(mapVehicleOptions(vehiclesData));

    if (dealersData && canFetchDealers) {
      setDealerOptions(mapDealerOptions(dealersData));
    }

    if (vehiclesData || (dealersData && canFetchDealers)) {
      setLoading(false);
    }
  }, [dealersData, vehiclesData, canFetchDealers]);

  // DEFAULT DEALER FOR DEALER STAFF
  useEffect(() => {
    if (isDealerStaff && user.dealerId) {
      form.setFieldsValue({ dealerId: [user.dealerId] });
    }
  }, [isDealerStaff, user.dealerId, form]);

  // SUBMIT
  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const payload = {
        dealerId: isDealerStaff ? [user.dealerId!] : values.dealerId ?? [],
        electricVehiclesId: values.electricVehiclesId,
        name: values.name.trim(),
        description: values.description?.trim() || "",
      };

      await createPromotion(payload);
      toast.success("Tạo khuyến mãi thành công!");
      navigate(-1);
    } catch {
      toast.error("Tạo khuyến mãi thất bại!");
    }
  };

  // LOADING
  if (loading || loadingDealers || loadingVehicles) {
    return (
      <div className="flex justify-center mt-20">
        <Spin size="large" />
      </div>
    );
  }

  // ACCESS GUARD
  if (!isDealerStaff && !isEvmStaff && !isAdmin) {
    toast.warning("Bạn không có quyền truy cập trang này!");
    navigate(-1);
    return null;
  }

  return (
    <CardWrapper>
      <Space style={{ marginBottom: 20 }}>
        <Button
          onClick={() => navigate(-1)}
          className="!bg-[#627254] !text-white !border-[#627254]"
        >
          ⬅ Quay lại
        </Button>
        <Title level={4}>Tạo khuyến mãi mới</Title>
      </Space>

      <Form<PromotionFormValues>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item label="Áp dụng cho đại lý" name="dealerId">
          <Select
            mode="multiple"
            allowClear
            disabled={isDealerStaff}
            placeholder={
              isDealerStaff
                ? "Tự động áp dụng cho đại lý của bạn"
                : "Bỏ trống để tạo khuyến mãi GLOBAL"
            }
            options={dealerOptions}
          />
        </Form.Item>

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
            placeholder="Chọn xe điện"
            options={vehicleOptions}
          />
        </Form.Item>

        <Form.Item
          label="Tên khuyến mãi"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên khuyến mãi" }]}
        >
          <Input placeholder="VD: Giảm giá 10%" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea
            rows={3}
            style={{ resize: "none", borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="!bg-[#627254] !border-[#627254] !text-white"
          >
            Tạo khuyến mãi
          </Button>
        </Form.Item>
      </Form>
    </CardWrapper>
  );
}
