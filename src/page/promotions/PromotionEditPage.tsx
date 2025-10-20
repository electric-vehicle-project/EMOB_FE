// src/pages/PromotionEditPage.tsx
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
  Spin,
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
import { getAllElectricVehicles } from "../../service/electricVehicleService";

const { RangePicker } = DatePicker;

interface PromotionFormValues {
  name: string;
  description?: string;
  type?: "PERCENTAGE" | "AMOUNT" | "ACCESSORY" | "INSTALLMENT_SUPPORT";
  value?: number;
  minPrice?: number;
  duration?: [dayjs.Dayjs, dayjs.Dayjs];
  electricVehiclesId?: string[];
}

interface PromotionDetail {
  id: string;
  name: string;
  description?: string;
  type?: PromotionFormValues["type"];
  value?: number;
  minPrice?: number;
  startDate: string;
  endDate: string;
  electricVehiclesId?: string[];
}

export default function PromotionEditPage() {
  const [form] = Form.useForm<PromotionFormValues>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const user = useSelector((s: RootState) => s.user ?? {}) as Partial<{
    id: string;
    role: string;
  }>;
  const role = (user.role || "ADMIN") as Role;
  const isStaff = ["DEALER_STAFF", "EVM_STAFF"].includes(role);
  const isManager = ["MANAGER", "ADMIN"].includes(role);

  // ===== API HOOKS =====
  const { data, isLoading } = usePromotionById(id ?? "");
  const { mutateAsync: updateBasic, isPending: isUpdatingBasic } =
    usePromotionUpdate();
  const { mutateAsync: updateValue, isPending: isUpdatingValue } =
    usePromotionUpdateValue();

  const [vehicleOptions, setVehicleOptions] = useState<
    { id: string; name: string }[]
  >([]);

  // ===== FETCH VEHICLE OPTIONS =====
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicles = await getAllElectricVehicles();
        if (Array.isArray(vehicles)) setVehicleOptions(vehicles);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchVehicles();
  }, []);

  // ===== SET FORM DEFAULT VALUES =====
  useEffect(() => {
    if (data?.result) {
      const p = data.result as PromotionDetail;
      form.setFieldsValue({
        name: p.name,
        description: p.description,
        type: p.type,
        value: p.value,
        minPrice: p.minPrice,
        duration: [dayjs(p.startDate), dayjs(p.endDate)],
        electricVehiclesId: p.electricVehiclesId ?? [],
      });
    }
  }, [data, form]);

  const handleBack = () => navigate(-1);

  // ===== HANDLE SUBMIT =====
  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const [start, end] = values.duration || [];

      if (isStaff) {
        // Staff chỉ được sửa name, description
        await updateBasic({
          id: id as string,
          data: {
            name: values.name?.trim(),
            description: values.description?.trim() || "",
          },
        });
      } else if (isManager) {
        // Manager/Admin được update value, minPrice, v.v...
        await updateValue({
          id: id as string,
          data: {
            value: values.value ?? 0,
            minPrice: values.minPrice ?? 0,
            type: values.type ?? "PERCENTAGE",
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            electricVehiclesId: values.electricVehiclesId ?? [],
          },
        });
      }

      message.success("Cập nhật khuyến mãi thành công!");
      handleBack();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật khuyến mãi thất bại!");
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

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
            <Form.Item label="Tên khuyến mãi" name="name">
              <Input
                placeholder="Nhập tên khuyến mãi"
                style={{ borderRadius: 8 }}
                disabled={!isStaff && !isManager}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Loại khuyến mãi" name="type">
              <Select
                disabled={isStaff}
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
            <Form.Item label="Giá trị (Value)" name="value">
              <InputNumber
                className="w-full"
                min={0}
                style={{ width: "100%", borderRadius: 8 }}
                disabled={isStaff}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={
                  ((v: string | undefined) =>
                    v?.replace(/,/g, "") || "") as InputNumberProps["parser"]
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Đơn tối thiểu (VNĐ)" name="minPrice">
              <InputNumber
                className="w-full"
                min={0}
                style={{ width: "100%", borderRadius: 8 }}
                disabled={isStaff}
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
            <Form.Item label="Xe điện áp dụng" name="electricVehiclesId">
              <Select
                mode="multiple"
                allowClear
                disabled={isStaff}
                placeholder="Chọn xe điện áp dụng"
                options={vehicleOptions.map((v) => ({
                  label: v.name,
                  value: v.id,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Thời gian áp dụng" name="duration">
              <RangePicker className="w-full" showTime disabled={isStaff} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
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
