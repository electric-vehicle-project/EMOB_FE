import { useEffect, useState } from "react";
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
} from "antd";
import type { InputNumberProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import type { RootState } from "../../redux/store";
import type { Role } from "../../utils/promotionPermissions";

import { usePromotionCreate } from "../../service/promotionService";
import { getAllDealers } from "../../service/dealerService";
import { getAllElectricVehicles } from "../../service/electricVehicleService";

const { RangePicker } = DatePicker;

interface PromotionFormValues {
  name: string;
  description?: string;
  type: "PERCENTAGE" | "AMOUNT" | "ACCESSORY" | "INSTALLMENT_SUPPORT";
  value?: number;
  minPrice?: number;
  duration: [dayjs.Dayjs, dayjs.Dayjs];
}

export default function PromotionCreatePage() {
  const [form] = Form.useForm<PromotionFormValues>();
  const navigate = useNavigate();

  // Lấy user từ Redux
  const user = useSelector((s: RootState) => s.user ?? {}) as Partial<{
    id: string;
    role: string;
    dealerId: string;
  }>;
  const role = (user?.role || "ADMIN") as Role;
  const dealerId = user?.dealerId as string | undefined;
  const staffId = user?.id as string | undefined;

  // Phân quyền
  const isDealerSide = role === "DEALER_STAFF" || role === "DEALER_MANAGER";

  // Options
  const [dealerOptions, setDealerOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  // Hook tạo
  const { mutateAsync: createPromotion, isPending } = usePromotionCreate();

  // Load dealers & vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealers, vehicles] = await Promise.all([
          getAllDealers(),
          getAllElectricVehicles(),
        ]);
        if (Array.isArray(dealers)) setDealerOptions(dealers);
        if (Array.isArray(vehicles)) setVehicleOptions(vehicles);
        if (isDealerSide && dealerId) setSelectedDealers([dealerId]);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [dealerId, isDealerSide]);

  // Submit
  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const [start, end] = values.duration || [];

      const payload = {
        staffId: staffId ?? null,
        dealerId: isDealerSide ? [dealerId] : selectedDealers, // [] = GLOBAL
        electricVehiclesId: selectedVehicles, // [] = all
        name: values.name.trim(),
        description: values.description?.trim() || "",
        type: values.type,
        value: Number(values.value ?? 0),
        minPrice: Number(values.minPrice ?? 0),
        startDate: start?.toISOString(),
        endDate: end?.toISOString(),
      };

      await createPromotion(payload);
      message.success("Tạo khuyến mãi thành công!");
      navigate(`/${role.toLowerCase().replace("_", "-")}/promotions`);
    } catch (err) {
      console.error(err);
      message.error("Tạo khuyến mãi thất bại!");
    }
  };

  const handleBack = () =>
    navigate(`/${role.toLowerCase().replace("_", "-")}/promotions`);

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 20 }}>
        <Button onClick={handleBack}>⬅ Quay lại</Button>
      </Space>

      <Form<PromotionFormValues>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: "PERCENTAGE",
          duration: [dayjs(), dayjs().add(30, "day")],
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên khuyến mãi"
              name="name"
              rules={[{ required: true, message: "Nhập tên khuyến mãi" }]}
            >
              <Input
                placeholder="Nhập tên khuyến mãi"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Loại khuyến mãi" name="type">
              <Select
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
            <Form.Item
              label="Phạm vi áp dụng"
              tooltip={
                !isDealerSide ? "Để trống = áp dụng tất cả (GLOBAL)" : undefined
              }
            >
              <Select
                mode="multiple"
                allowClear
                placeholder={
                  isDealerSide
                    ? "Đại lý của bạn"
                    : "Chọn đại lý (để trống = tất cả)"
                }
                disabled={isDealerSide}
                value={selectedDealers}
                onChange={setSelectedDealers}
                options={dealerOptions.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Giá trị  "
              name="value"
              tooltip={
                isDealerSide
                  ? "Dealer Staff hoặc EVM Staff không thể nhập, chờ cấp trên duyệt giá trị."
                  : undefined
              }
              rules={
                ["ADMIN", "DEALER_MANAGER"].includes(role)
                  ? [{ required: true, message: "Nhập giá trị" }]
                  : []
              }
            >
              <InputNumber
                className="w-full"
                min={0}
                style={{ width: "100%", borderRadius: 9 }}
                disabled={["DEALER_STAFF", "EVM_STAFF"].includes(role)}
                placeholder={
                  ["DEALER_STAFF", "EVM_STAFF"].includes(role)
                    ? ""
                    : "Nhập giá trị khuyến mãi"
                }
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={
                  ((v: string | undefined) =>
                    v?.replace(/,/g, "") || "") as InputNumberProps["parser"]
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Đơn tối thiểu (VNĐ)" name="minPrice">
              <InputNumber
                className="w-full"
                min={0}
                style={{ width: "100%" }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={
                  ((v: string | undefined) =>
                    v?.replace(/,/g, "") || "") as InputNumberProps["parser"]
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Thời gian áp dụng"
              name="duration"
              rules={[{ required: true, message: "Chọn thời gian áp dụng" }]}
            >
              <RangePicker className="w-full" showTime />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Loại xe điện áp dụng">
              <Select
                mode="multiple"
                allowClear
                placeholder="Chọn xe điện (để trống = tất cả)"
                value={selectedVehicles}
                onChange={setSelectedVehicles}
                options={vehicleOptions.map((v) => ({
                  label: v.name,
                  value: v.id,
                }))}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả chi tiết khuyến mãi"
                style={{ resize: "none", borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo khuyến mãi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
