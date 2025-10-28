import { useEffect, useMemo, useState } from "react";
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
  Spin,
  Tag,
  Alert,
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

import {
  usePromotionById,
  usePromotionUpdate,
  usePromotionUpdateValue,
} from "../../service/promotionService";
import { useGetDealers } from "../../service/dealerService";
import { useGetVehicles } from "../../service/vehicleService";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../utils/mapToSelectOptions";

const { RangePicker } = DatePicker;

type Role = "ADMIN" | "MANAGER" | "EVM_STAFF" | "DEALER_STAFF";
interface AppUser {
  id: string;
  role: Role;
  dealerId?: string;
}

type FormValues = {
  name: string;
  description?: string;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | "POINT";
  value?: number;
  minValue?: number;
  duration?: [dayjs.Dayjs, dayjs.Dayjs];
  dealerIds?: string[];
  electricVehicleIds?: string[];
};

export default function PromotionEditPage() {
  const [form] = Form.useForm<FormValues>();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const missingId = !paramId;

  const user = useSelector<RootState, AppUser | null>(
    (s) => (s as any).user ?? null
  );
  const role: Role = user?.role ?? "ADMIN";

  const isEvmStaff = role === "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";
  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  const canEditTargets = isEvmStaff || isDealerStaff;
  const canPickDealers = isEvmStaff;

  const { data, isLoading } = usePromotionById(paramId);
  const { mutateAsync: updateBasic, isPending: updatingBasic } =
    usePromotionUpdate();
  const { mutateAsync: updateValue, isPending: updatingValue } =
    usePromotionUpdateValue();

  const { data: dealersData, isLoading: loadingDealers } = useGetDealers({
    enabled: canPickDealers,
  } as any);
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: canEditTargets,
  } as any);

  const p = data?.result as
    | {
        id: string;
        name: string;
        description?: string;
        type?: "PERCENTAGE" | "FIXED_AMOUNT" | "POINT";
        value?: number;
        minValue?: number;
        startDate?: string | null;
        endDate?: string | null;
        dealerIds?: string[];
        vehicleIds?: string[];
      }
    | undefined;

  const [existingDealerIds, setExistingDealerIds] = useState<string[]>([]);
  const [existingVehicleIds, setExistingVehicleIds] = useState<string[]>([]);

  const dealerOptions = useMemo(
    () => mapDealerOptions(dealersData),
    [dealersData]
  );
  const vehicleOptions = useMemo(
    () => mapVehicleOptions(vehiclesData),
    [vehiclesData]
  );

  const findDealerLabel = (id: string) =>
    dealerOptions.find((x) => x.value === id)?.label ?? id;

  const findVehicleLabel = (id: string) =>
    vehicleOptions.find((x) => x.value === id)?.label ?? "Unknown Vehicle";

  const tagRender =
    (existingIds: string[], findLabel: (id: string) => string) =>
    (props: any) => {
      const { value, closable, onClose } = props;
      const isOld = existingIds.includes(value);
      return (
        <Tag
          color={isOld ? "default" : "blue"}
          closable={!isOld && closable}
          onClose={isOld ? (e) => e.preventDefault() : onClose}
        >
          {findLabel(value)}
        </Tag>
      );
    };

  /** ✅ Tự động điền thời gian áp dụng */
  useEffect(() => {
    if (!p) return;

    const dealers = p.dealerIds ?? [];
    const vehicles = p.vehicleIds ?? [];

    setExistingDealerIds(dealers);
    setExistingVehicleIds(vehicles);

    const start = p.startDate ? dayjs(p.startDate) : dayjs();
    const end = p.endDate ? dayjs(p.endDate) : dayjs().add(7, "day");

    form.setFieldsValue({
      name: p.name,
      description: p.description,
      value: p.value,
      minValue: p.minValue,
      type: p.type ?? "PERCENTAGE",
      duration: [start, end],
      dealerIds: dealers,
      electricVehicleIds: vehicles,
    });
  }, [p, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!paramId) {
      message.error("Thiếu ID khuyến mãi trong URL!");
      return;
    }
    try {
      const [start, end] = values.duration || [];

      const addedDealers = (values.dealerIds || []).filter(
        (x) => !existingDealerIds.includes(x)
      );
      const addedVehicles = (values.electricVehicleIds || []).filter(
        (x) => !existingVehicleIds.includes(x)
      );

      const payloadBase = {
        name: values.name,
        description: values.description,
        dealerIds: isDealerStaff ? [] : addedDealers,
        electricVehicleIds: addedVehicles,
      };

      if (canEditTargets) {
        await updateBasic({ id: paramId, data: payloadBase });
      }
      if (isManager || isAdmin) {
        await updateValue({
          id: paramId,
          data: {
            value: values.value ?? 0,
            minPrice: values.minValue ?? 0,
            type: values.type ?? "PERCENTAGE",
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
          },
        });
      }

      message.success("Cập nhật khuyến mãi thành công!");
      navigate(-1);
    } catch {
      message.error("Cập nhật khuyến mãi thất bại!");
    }
  };

  if (isLoading || loadingDealers || loadingVehicles) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Quay lại
      </Button>

      {missingId && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="Thiếu ID khuyến mãi"
          description="Đường dẫn không chứa ID hợp lệ. Vui lòng quay lại danh sách và mở lại trang chỉnh sửa."
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên khuyến mãi"
              name="name"
              rules={[{ required: true, message: "Nhập tên khuyến mãi" }]}
            >
              <Input disabled={isManager || isAdmin} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Loại khuyến mãi" name="type">
              <Select
                disabled={!isManager && !isAdmin}
                options={[
                  { label: "Giảm theo phần trăm (%)", value: "PERCENTAGE" },
                  { label: "Giảm cố định (VNĐ)", value: "FIXED_AMOUNT" },
                  { label: "Điểm thưởng", value: "POINT" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Giá trị (%) hoặc VNĐ" name="value">
              <InputNumber
                disabled={!isManager && !isAdmin}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Đơn tối thiểu (VNĐ)" name="minValue">
              <InputNumber
                disabled={!isManager && !isAdmin}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        {canEditTargets && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Dealer áp dụng" name="dealerIds">
                <Select
                  mode="multiple"
                  disabled={!canPickDealers}
                  tagRender={tagRender(existingDealerIds, findDealerLabel)}
                  options={
                    canPickDealers
                      ? dealerOptions.filter(
                          (o) => !existingDealerIds.includes(o.value)
                        )
                      : []
                  }
                  placeholder={
                    isDealerStaff
                      ? "Đại lý của bạn sẽ tự động áp dụng"
                      : "Chọn dealer mới để áp dụng thêm"
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Mẫu xe áp dụng" name="electricVehicleIds">
                <Select
                  mode="multiple"
                  tagRender={tagRender(existingVehicleIds, findVehicleLabel)}
                  options={vehicleOptions.filter(
                    (o) => !existingVehicleIds.includes(o.value)
                  )}
                  placeholder="Chọn mẫu xe mới để áp dụng thêm"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Thời gian áp dụng" name="duration">
              <RangePicker
                showTime
                disabled={!isManager && !isAdmin}
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                rows={3}
                disabled={isManager || isAdmin}
                style={{
                  resize: "none",
                  borderRadius: 8,
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={updatingBasic || updatingValue}
          >
            Cập nhật khuyến mãi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
