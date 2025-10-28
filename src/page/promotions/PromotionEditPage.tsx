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
  Space,
  Spin,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
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

export default function PromotionEditPage() {
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);
  const role = user?.role;

  const isEvmStaff = role === "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";
  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  const { data, isLoading } = usePromotionById(id ?? "");
  const { mutateAsync: updateBasic, isPending: updatingBasic } =
    usePromotionUpdate();
  const { mutateAsync: updateValue, isPending: updatingValue } =
    usePromotionUpdateValue();

  const { data: dealersData, isLoading: loadingDealers } = useGetDealers({
    enabled: isEvmStaff,
  } as any);
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: isEvmStaff || isDealerStaff,
  } as any);

  const p = data?.result;
  const [existingDealerIds, setExistingDealerIds] = useState<string[]>([]);
  const [existingVehicleIds, setExistingVehicleIds] = useState<string[]>([]);

  // Map option có label đẹp
  const dealerOptions = useMemo(
    () => mapDealerOptions(dealersData),
    [dealersData]
  );
  const vehicleOptions = useMemo(
    () => mapVehicleOptions(vehiclesData),
    [vehiclesData]
  );

  // Hàm tìm label từ ID (để hiển thị tag tên thay vì id)
  const findDealerLabel = (id: string) =>
    dealerOptions.find((x) => x.value === id)?.label ?? id;

  const findVehicleLabel = (id: string) =>
    vehicleOptions.find((x) => x.value === id)?.label ?? "Unknown Vehicle";

  // Render tag, khóa tag cũ không cho xóa
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

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (!p) return;
    const dealers = p.dealerIds ?? [];
    const vehicles = p.vehicleIds ?? [];
    setExistingDealerIds(dealers);
    setExistingVehicleIds(vehicles);

    const start = p.startDate ? dayjs(p.startDate) : undefined;
    const end = p.endDate ? dayjs(p.endDate) : undefined;

    form.setFieldsValue({
      name: p.name,
      description: p.description,
      value: p.value,
      minValue: p.minValue,
      type: p.type ?? "PERCENTAGE",
      duration: start && end ? [start, end] : undefined,
      dealerIds: dealers,
      electricVehicleIds: vehicles,
    });
  }, [p]);

  // Submit form
  const handleSubmit = async (values: any) => {
    try {
      const [start, end] = values.duration || [];
      const addedDealers = (values.dealerIds || []).filter(
        (id: string) => !existingDealerIds.includes(id)
      );
      const addedVehicles = (values.electricVehicleIds || []).filter(
        (id: string) => !existingVehicleIds.includes(id)
      );

      const payloadBase = {
        name: values.name,
        description: values.description,
        dealerIds: isDealerStaff ? [] : addedDealers,
        electricVehicleIds: addedVehicles,
      };

      if (isEvmStaff || isDealerStaff) {
        await updateBasic({ id, data: payloadBase });
      }
      if (isManager || isAdmin) {
        await updateValue({
          id,
          data: {
            value: values.value,
            minPrice: values.minValue,
            type: values.type,
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

  if (isLoading || loadingDealers || loadingVehicles)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Quay lại
      </Button>

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

        {/* Field chỉ hiển thị cho EVM_STAFF & DEALER_STAFF */}
        {(isEvmStaff || isDealerStaff) && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Dealer áp dụng" name="dealerIds">
                <Select
                  mode="multiple"
                  disabled={isDealerStaff}
                  tagRender={tagRender(existingDealerIds, findDealerLabel)}
                  options={
                    isEvmStaff
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
              <Input.TextArea rows={3} disabled={isManager || isAdmin} />
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
