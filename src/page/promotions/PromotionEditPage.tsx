import { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  InputNumber,
  message,
  Space,
  Spin,
  Tag,
} from "antd";
import type { InputNumberProps } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import type { RootState } from "../../redux/store";
import type { Role } from "../../utils/promotionPermissions";

import {
  usePromotionById,
  usePromotionUpdate,
  usePromotionUpdateValue,
} from "../../service/promotionService";

import { useGetDealers } from "../../service/dealerService";
import { useGetVehicles } from "../../service/vehicleService";

const { RangePicker } = DatePicker;

type PromoType = "PERCENTAGE" | "AMOUNT" | "ACCESSORY" | "INSTALLMENT_SUPPORT";

interface DealerOption {
  id: string;
  name: string;
}

interface VehicleOption {
  id: string;
  name: string;
}

interface PromotionFormValues {
  name: string;
  description?: string;
  type?: PromoType;
  value?: number;
  minValue?: number;
  duration?: [dayjs.Dayjs, dayjs.Dayjs];
  dealerIds?: string[];
  electricVehicleIds?: string[];
}

interface PromotionDetail {
  id: string;
  name: string;
  description?: string;
  type: PromoType;
  value: number;
  minValue: number;
  startDate?: string | null;
  endDate?: string | null;
  dealerIds?: string[];
  electricVehicleIds?: string[];
}

export default function PromotionEditPage() {
  const [form] = Form.useForm<PromotionFormValues>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ===== USER & ROLE =====
  const user = useSelector((s: RootState) => s.user ?? {}) as Partial<{
    id: string;
    role: Role;
  }>;

  const role = (user.role || "ADMIN") as Role;
  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";
  const isManager = role === "MANAGER" || role === "ADMIN";

  const canFetchDealers = isEvmStaff || role === "ADMIN";

  // ===== API HOOKS =====
  const { data, isLoading } = usePromotionById(id ?? "");
  const { mutateAsync: updateBasic, isPending: isUpdatingBasic } =
    usePromotionUpdate();
  const { mutateAsync: updateValue, isPending: isUpdatingValue } =
    usePromotionUpdateValue();

  const { data: dealersData, isLoading: loadingDealers } = useGetDealers({
    enabled: canFetchDealers,
  } as any);
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: canFetchDealers,
  } as any);

  // ===== OPTIONS FILTER =====
  const dealerOptions = useMemo(() => {
    if (!canFetchDealers) return [];
    const list: DealerOption[] =
      dealersData?.result?.data ?? dealersData?.result ?? dealersData ?? [];
    const usedIds = data?.result?.dealerIds ?? [];
    return list
      .filter((d) => !usedIds.includes(d.id))
      .map((d) => ({ label: d.name, value: d.id }));
  }, [dealersData, data, canFetchDealers]);

  const vehicleOptions = useMemo(() => {
    if (!canFetchDealers) return [];
    const list: VehicleOption[] =
      vehiclesData?.result?.data ?? vehiclesData?.result ?? vehiclesData ?? [];
    const usedIds = data?.result?.electricVehicleIds ?? [];
    return list
      .filter((v) => !usedIds.includes(v.id))
      .map((v) => ({ label: v.name, value: v.id }));
  }, [vehiclesData, data, canFetchDealers]);

  // ===== INITIAL FORM =====
  useEffect(() => {
    if (!data?.result) return;
    const p = data.result as PromotionDetail;

    // ✅ Fix Invalid Date
    const start =
      p.startDate && dayjs(p.startDate).isValid()
        ? dayjs(p.startDate)
        : undefined;
    const end =
      p.endDate && dayjs(p.endDate).isValid() ? dayjs(p.endDate) : undefined;

    form.setFieldsValue({
      name: p.name,
      description: p.description,
      type: p.type,
      value: p.value,
      minValue: p.minValue,
      duration: start && end ? [start, end] : undefined,
      dealerIds: [],
      electricVehicleIds: [],
    });
  }, [data, form]);

  const handleBack = () => navigate(-1);

  // ===== SUBMIT =====
  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const [start, end] = values.duration || [];

      if (isDealerStaff || isEvmStaff) {
        await updateBasic({
          id: id as string,
          data: {
            name: values.name?.trim(),
            description: values.description?.trim() || "",
            dealerIds: isDealerStaff ? [] : values.dealerIds ?? [],
            electricVehicleIds: values.electricVehicleIds ?? [],
          },
        });
      }

      if (isManager) {
        await updateValue({
          id: id as string,
          data: {
            value: values.value ?? 0,
            minPrice: values.minValue ?? 0, // ✅ BE dùng minPrice
            type: values.type ?? "PERCENTAGE",
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
          },
        });
      }

      message.success("Cập nhật khuyến mãi thành công!");
      navigate(-1);
    } catch (error: unknown) {
      console.error(error);
      message.error("Cập nhật khuyến mãi thất bại!");
    }
  };

  if (isLoading || (canFetchDealers && (loadingDealers || loadingVehicles))) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const p = (data?.result ?? {}) as PromotionDetail;

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 20 }}>
        <Button onClick={handleBack}>⬅ Quay lại</Button>
      </Space>

      <Form<PromotionFormValues>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên khuyến mãi"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input
                placeholder="Nhập tên khuyến mãi"
                disabled={isManager}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Loại khuyến mãi" name="type">
              <Select
                disabled={!isEvmStaff && !isDealerStaff}
                options={[
                  { label: "Giảm theo phần trăm (%)", value: "PERCENTAGE" },
                  { label: "Giảm cố định (VNĐ)", value: "AMOUNT" },
                  { label: "Tặng phụ kiện", value: "ACCESSORY" },
                  { label: "Hỗ trợ trả góp", value: "INSTALLMENT_SUPPORT" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Giá trị (%) hoặc VNĐ" name="value">
              <InputNumber
                min={0}
                disabled={!isManager}
                style={{ width: "100%", borderRadius: 8 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={
                  ((v: string | undefined) =>
                    v ? v.replace(/,/g, "") : "") as InputNumberProps["parser"]
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Đơn tối thiểu (VNĐ)" name="minValue">
              <InputNumber
                min={0}
                disabled={!isManager}
                style={{ width: "100%", borderRadius: 8 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={
                  ((v: string | undefined) =>
                    v ? v.replace(/,/g, "") : "") as InputNumberProps["parser"]
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {canFetchDealers && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Thêm Dealer áp dụng" name="dealerIds">
                <Select
                  mode="multiple"
                  allowClear
                  options={dealerOptions}
                  placeholder="Chọn dealer mới để áp dụng thêm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Thêm mẫu xe áp dụng" name="electricVehicleIds">
                <Select
                  mode="multiple"
                  allowClear
                  options={vehicleOptions}
                  placeholder="Chọn xe mới để áp dụng thêm"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {(p.dealerIds?.length || p.electricVehicleIds?.length) && (
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Dealer hiện đang áp dụng:
              </div>
              <Space wrap>
                {(p.dealerIds ?? []).map((d) => (
                  <Tag key={d}>{d}</Tag>
                ))}
              </Space>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Mẫu xe hiện đang áp dụng:
              </div>
              <Space wrap>
                {(p.electricVehicleIds ?? []).map((v) => (
                  <Tag key={v}>{v}</Tag>
                ))}
              </Space>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Thời gian áp dụng" name="duration">
              <RangePicker
                className="w-full"
                showTime
                disabled={!isManager}
                format="YYYY-MM-DD HH:mm"
                placeholder={["Chưa có ngày bắt đầu", "Chưa có ngày kết thúc"]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                disabled={isManager}
                rows={3}
                placeholder="Mô tả chi tiết khuyến mãi"
                style={{ resize: "none", borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isUpdatingBasic || isUpdatingValue}
          >
            Cập nhật khuyến mãi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
