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

import dayjs from "dayjs";
import type { Promotion } from "../../../model/Promotion";
import { useDealersQuery } from "../../../service/dealerService";
import { useGetVehicles } from "../../../service/vehicleService";
import { useEffect } from "react";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../../utils/mapToSelectOptions";

const { RangePicker } = DatePicker;

interface Props {
  mode: "create" | "edit";
  initialValues?: Partial<Promotion>;
  onSubmit: (values: any) => void;
  isDealerScoped?: boolean;
  loading?: boolean;
}

/**
 * Form tạo / chỉnh sửa Promotion, tái sử dụng giữa Create và Edit Page.
 */
export const PromotionForm = ({
  mode,
  initialValues,
  onSubmit,
  isDealerScoped,
  loading,
}: Props) => {
  const [form] = Form.useForm();
  const { data: dealersData } = useDealersQuery({}, { size: 1000 });
  const { data: vehicles } = useGetVehicles();

  const dealers = dealersData?.result?.data ?? [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        duration:
          initialValues.startDate && initialValues.endDate
            ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
            : undefined,
      });
    }
  }, [initialValues]);

  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      startDate: values.duration?.[0]?.toISOString(),
      endDate: values.duration?.[1]?.toISOString(),
    };
    delete payload.duration;
    onSubmit(payload);
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
            <Input placeholder="Nhập tên chương trình" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="type"
            label="Loại khuyến mãi"
            rules={[{ required: true }]}
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

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="scope" label="Phạm vi" rules={[{ required: true }]}>
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
            rules={[{ required: true, message: "Nhập giá trị" }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

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
            rules={[{ required: true, message: "Chọn thời gian" }]}
          >
            <RangePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea
          placeholder="Mô tả chương trình..."
          rows={3}
          style={{ resize: "none", borderRadius: 8 }}
        />
      </Form.Item>

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
            <Form.Item name="vehicleIds" label="Xe áp dụng">
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

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading}>
          {mode === "create" ? "Tạo khuyến mãi" : "Cập nhật"}
        </Button>
      </div>
    </Form>
  );
};
