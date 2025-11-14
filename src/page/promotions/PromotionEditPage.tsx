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
import { useGetVehicles } from "../../service/vehicleService";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../utils/mapToSelectOptions";
import { useDealersQuery } from "../../service/dealerService";

const { RangePicker } = DatePicker;

// Loại vai trò người dùng
type Role = "ADMIN" | "MANAGER" | "EVM_STAFF" | "DEALER_STAFF";

// Kiểu dữ liệu người dùng đăng nhập
interface AppUser {
  id: string;
  role: Role;
  dealerId?: string;
}

// Dữ liệu form chỉnh sửa khuyến mãi
interface FormValues {
  name: string;
  description?: string;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | "POINT";
  value?: number;
  minValue?: number;
  duration?: [dayjs.Dayjs, dayjs.Dayjs];
  dealerIds?: string[];
  electricVehicleIds?: string[];
}

interface DealerOption {
  label: string;
  value: string;
}

interface VehicleOption {
  label: string;
  value: string;
}

export default function PromotionEditPage() {
  const [form] = Form.useForm<FormValues>();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const missingId = !paramId;

  // Lấy thông tin user từ Redux store
  const user = useSelector((state: RootState) => state.user) as AppUser | null;
  const role: Role = user?.role ?? "ADMIN";

  const isEvmStaff = role === "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";
  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  // Quyền chỉnh sửa
  const canEditTargets = isEvmStaff || isDealerStaff;
  const canPickDealers = isEvmStaff;

  // Lấy dữ liệu khuyến mãi theo ID
  const { data, isLoading } = usePromotionById(paramId);
  const { mutateAsync: updateBasic, isPending: updatingBasic } =
    usePromotionUpdate();
  const { mutateAsync: updateValue, isPending: updatingValue } =
    usePromotionUpdateValue();

  // Lấy danh sách đại lý (khi có quyền chọn)
  const { data: dealersData, isLoading: loadingDealers } = useDealersQuery(
    {},
    { enabled: canPickDealers }
  );

  // Lấy danh sách xe điện (khi có quyền chỉnh sửa)
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: canEditTargets,
  });

  // Chuẩn hóa dữ liệu trả về từ API
  const promotion = data?.result as
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

  // Lưu lại danh sách đã áp dụng
  const [existingDealerIds, setExistingDealerIds] = useState<string[]>([]);
  const [existingVehicleIds, setExistingVehicleIds] = useState<string[]>([]);

  // Chuẩn hóa dữ liệu Select
  const dealerOptions: DealerOption[] = useMemo(
    () => mapDealerOptions(dealersData),
    [dealersData]
  );
  const vehicleOptions: VehicleOption[] = useMemo(
    () => mapVehicleOptions(vehiclesData),
    [vehiclesData]
  );

  // Tìm label cho tag hiển thị
  const findDealerLabel = (id: string) =>
    dealerOptions.find((x) => x.value === id)?.label ?? id;

  const findVehicleLabel = (id: string) =>
    vehicleOptions.find((x) => x.value === id)?.label ?? "Xe không xác định";

  // Tùy chỉnh hiển thị tag
  const tagRender =
    (existingIds: string[], findLabel: (id: string) => string) =>
    (props: { value: string; closable: boolean; onClose: () => void }) => {
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

  // Gán dữ liệu ban đầu cho form
  useEffect(() => {
    if (!promotion) return;

    const dealers = promotion.dealerIds ?? [];
    const vehicles = promotion.vehicleIds ?? [];

    setExistingDealerIds(dealers);
    setExistingVehicleIds(vehicles);

    const start = promotion.startDate ? dayjs(promotion.startDate) : dayjs();
    const end = promotion.endDate
      ? dayjs(promotion.endDate)
      : dayjs().add(7, "day");

    form.setFieldsValue({
      name: promotion.name,
      description: promotion.description,
      value: promotion.value,
      minValue: promotion.minValue,
      type: promotion.type ?? "PERCENTAGE",
      duration: [start, end],
      dealerIds: dealers,
      electricVehicleIds: vehicles,
    });
  }, [promotion, form]);

  // Xử lý submit form
  const handleSubmit = async (values: FormValues) => {
    if (!paramId) {
      toast.error("Thiếu ID khuyến mãi trong URL!");
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

      toast.success("Cập nhật khuyến mãi thành công!");
      navigate(-1);
    } catch {
      toast.error("Cập nhật khuyến mãi thất bại!");
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
        Quay lại
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
                style={{ resize: "none", borderRadius: 8 }}
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
