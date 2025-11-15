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
import dayjs, { Dayjs } from "dayjs";
import type { Promotion } from "../../../model/Promotion";
import { useDealersQuery } from "../../../service/dealerService";
import { useGetVehicles } from "../../../service/vehicleService";
import { useEffect } from "react";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../../utils/mapToSelectOptions";

const { RangePicker } = DatePicker;

/**
 * Dữ liệu dùng trong form (FE) — ánh xạ với Promotion BE.
 * `minValue` và `electricVehicleIds` khớp đúng tên với BE.
 */
interface PromotionFormValues {
  name: string;
  type: "PERCENTAGE" | "AMOUNT" | "ACCESSORY" | "INSTALLMENT_SUPPORT";
  scope: "GLOBAL" | "LOCAL";
  value: number;
  minValue?: number;
  duration?: [Dayjs, Dayjs];
  description?: string;
  dealerIds?: string[];
  electricVehicleIds?: string[];
}

/**
 * Props cho component PromotionForm
 */
interface Props {
  mode: "create" | "edit";
  initialValues?: Partial<Promotion>;
  onSubmit: (
    values: Omit<PromotionFormValues, "duration"> & {
      startDate?: string;
      endDate?: string;
    }
  ) => void;
  isDealerScoped?: boolean;
  loading?: boolean;
}

/**
 * Form tạo / chỉnh sửa khuyến mãi — chuẩn hoá type theo BE (không any, không ép kiểu).
 */
export const PromotionForm = ({
  mode,
  initialValues,
  onSubmit,
  isDealerScoped,
  loading,
}: Props) => {
  const [form] = Form.useForm<PromotionFormValues>();
  const { data: dealersData } = useDealersQuery(
    0,
    1000,
    "",
    "createdAt",
    "desc",
    undefined,
    true
  );

  const { data: vehicles } = useGetVehicles();

  const dealers = dealersData?.result?.data ?? [];

  /**
   * Gán dữ liệu ban đầu khi edit.
   * Dùng đúng các field có trong Promotion.
   */
  useEffect(() => {
    if (!initialValues) return;

    const start = initialValues.startDate
      ? dayjs(initialValues.startDate)
      : undefined;
    const end = initialValues.endDate
      ? dayjs(initialValues.endDate)
      : undefined;

    form.setFieldsValue({
      name: initialValues.name,
      type: initialValues.type as PromotionFormValues["type"],
      scope: initialValues.scope as PromotionFormValues["scope"],
      value: initialValues.value ?? 0,
      minValue: initialValues.minValue,
      description: initialValues.description,
      duration: start && end ? [start, end] : undefined,
    });
  }, [initialValues, form]);

  /**
   * Xử lý khi submit form — map `duration` thành `startDate` và `endDate`
   */
  const handleFinish = (values: PromotionFormValues) => {
    const payload = {
      ...values,
      startDate: values.duration?.[0]?.toISOString(),
      endDate: values.duration?.[1]?.toISOString(),
    };

    // Xoá duration vì BE không nhận field này
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { duration, ...finalPayload } = payload;
    onSubmit(finalPayload);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      disabled={loading}
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      {/* Tên chương trình + Loại */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên chương trình"
            rules={[{ required: true, message: "Nhập tên chương trình" }]}
          >
            <Input placeholder="Nhập tên chương trình" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="type"
            label="Loại khuyến mãi"
            rules={[{ required: true, message: "Chọn loại khuyến mãi" }]}
          >
            <Select
              options={[
                { label: "Giảm theo phần trăm", value: "PERCENTAGE" },
                { label: "Giảm theo số tiền", value: "AMOUNT" },
                { label: "Tặng phụ kiện", value: "ACCESSORY" },
                { label: "Hỗ trợ trả góp", value: "INSTALLMENT_SUPPORT" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Phạm vi + Giá trị */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="scope"
            label="Phạm vi"
            rules={[{ required: true, message: "Chọn phạm vi" }]}
          >
            <Select
              options={[
                { label: "Toàn hệ thống", value: "GLOBAL" },
                { label: "Cục bộ (Đại lý)", value: "LOCAL" },
              ]}
              disabled={isDealerScoped}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="value"
            label="Giá trị khuyến mãi (%)"
            rules={[{ required: true, message: "Nhập giá trị khuyến mãi" }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Giá trị tối thiểu + Thời gian */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="minValue"
            label="Giá trị tối thiểu (VNĐ)"
            tooltip="Giá trị đơn hàng tối thiểu để áp dụng"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
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

      {/* Mô tả */}
      <Form.Item name="description" label="Mô tả">
        <Input.TextArea
          placeholder="Mô tả chương trình..."
          rows={3}
          style={{ resize: "none", borderRadius: 8 }}
        />
      </Form.Item>

      {/* Áp dụng cho dealer + xe */}
      {!isDealerScoped && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="dealerIds" label="Đại lý áp dụng">
              <Select
                mode="multiple"
                placeholder="Chọn đại lý"
                options={mapDealerOptions(dealers)}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="electricVehicleIds" label="Xe áp dụng">
              <Select
                mode="multiple"
                placeholder="Chọn xe"
                options={mapVehicleOptions(vehicles)}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading}>
          {mode === "create" ? "Tạo khuyến mãi" : "Cập nhật"}
        </Button>
      </div>
    </Form>
  );
};
