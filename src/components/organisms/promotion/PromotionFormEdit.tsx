import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
} from "antd";
import { useEffect } from "react";
import type { Dayjs } from "dayjs";
import type { PromotionType, PromotionScope } from "../../../model/Promotion";
import { useDealersQuery } from "../../../service/dealerService";
import { useGetVehicles } from "../../../service/vehicleService";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../../utils/mapToSelectOptions";

const { RangePicker } = DatePicker;

export interface PromotionEditValues {
  name: string;
  description?: string;
  type: PromotionType | null;
  scope: PromotionScope;
  value: number;
  minValue?: number;
  dealerIds?: string[];
  electricVehicleIds?: string[];
  duration?: [Dayjs, Dayjs];
}

interface Props {
  mode: "create" | "edit";
  initialValues?: Partial<PromotionEditValues>;
  onSubmit: (
    values: Omit<PromotionEditValues, "duration"> & {
      startDate?: string;
      endDate?: string;
    }
  ) => void;
  canEditName: boolean;
  canEditDescription: boolean;
  canEditTargets: boolean;
  canEditValue: boolean;
  isDealerStaff: boolean;
  loading?: boolean;
}

export const PromotionFormEdit = ({
  mode,
  initialValues,
  onSubmit,
  canEditName,
  canEditDescription,
  canEditTargets,
  canEditValue,
  isDealerStaff,
  loading,
}: Props) => {
  const [form] = Form.useForm<PromotionEditValues>();

  const { data: dealersData } = useDealersQuery(
    0,
    1000,
    "",
    "createdAt",
    "desc",
    undefined,
    true
  );
  const dealers = dealersData?.result?.data ?? [];

  const { data: vehicles } = useGetVehicles();

  useEffect(() => {
    if (!initialValues) return;

    form.setFieldsValue({
      name: initialValues.name,
      description: initialValues.description,
      type: initialValues.type ?? null,
      scope: initialValues.scope,
      value: initialValues.value ?? 0,
      minValue: initialValues.minValue,
      dealerIds: initialValues.dealerIds,
      electricVehicleIds: initialValues.electricVehicleIds,
      duration: initialValues.duration,
    });
  }, [initialValues, form]);

  const handleFinish = (values: PromotionEditValues) => {
    const finalPayload = {
      ...values,
      startDate: values.duration?.[0]?.toISOString(),
      endDate: values.duration?.[1]?.toISOString(),
    };

    const result: Omit<PromotionEditValues, "duration"> & {
      startDate?: string;
      endDate?: string;
    } = {
      name: finalPayload.name,
      description: finalPayload.description,
      type: finalPayload.type,
      scope: finalPayload.scope,
      value: finalPayload.value,
      minValue: finalPayload.minValue,
      dealerIds: finalPayload.dealerIds,
      electricVehicleIds: finalPayload.electricVehicleIds,
      startDate: finalPayload.startDate,
      endDate: finalPayload.endDate,
    };

    onSubmit(result);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      disabled={loading}
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên chương trình"
            rules={[{ required: true, message: "Nhập tên chương trình" }]}
          >
            <Input
              placeholder="Nhập tên chương trình"
              disabled={!canEditName}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="type"
            label="Loại khuyến mãi"
            rules={[{ required: true, message: "Chọn loại khuyến mãi" }]}
          >
            <Select
              disabled={!canEditValue}
              options={[
                { label: "Giảm theo %", value: "PERCENTAGE" },
                { label: "Giảm số tiền", value: "FIXED_AMOUNT" },
                { label: "Tặng điểm thưởng", value: "POINT" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="scope"
            label="Phạm vi"
            rules={[{ required: true, message: "Chọn phạm vi" }]}
          >
            <Select
              disabled={mode === "edit"}
              options={[
                { label: "Toàn hệ thống", value: "GLOBAL" },
                { label: "Đại lý", value: "LOCAL" },
              ]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="value"
            label="Giá trị khuyến mãi"
            rules={[{ required: true, message: "Nhập giá trị" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              disabled={!canEditValue}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="minValue" label="Giá trị tối thiểu">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              disabled={!canEditValue}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="duration"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: "Chọn thời gian áp dụng" }]}
          >
            <RangePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea
          rows={3}
          style={{ resize: "none", borderRadius: 8 }}
          disabled={!canEditDescription}
        />
      </Form.Item>

      {/* EVM_STAFF: chỉnh dealer + xe; DEALER_STAFF: chỉ chỉnh xe */}
      {(canEditTargets || !isDealerStaff) && (
        <Row gutter={16}>
          {!isDealerStaff && (
            <Col span={12}>
              <Form.Item name="dealerIds" label="Áp dụng cho đại lý">
                <Select
                  mode="multiple"
                  options={mapDealerOptions(dealers)}
                  allowClear
                  disabled={!canEditTargets}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={isDealerStaff ? 24 : 12}>
            <Form.Item name="electricVehicleIds" label="Áp dụng cho xe">
              <Select
                mode="multiple"
                options={mapVehicleOptions(vehicles)}
                allowClear
                disabled={!canEditTargets}
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading}>
          {mode === "create" ? "Tạo khuyến mãi" : "Cập nhật"}
        </Button>
      </div>
    </Form>
  );
};
