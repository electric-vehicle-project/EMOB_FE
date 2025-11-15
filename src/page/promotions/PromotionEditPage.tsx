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
  Spin,
  Tag,
} from "antd";
import type { Dayjs } from "dayjs";
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
import { toast } from "react-toastify";
import { CardWrapper } from "../../components/template/CardWrapper";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";

const { RangePicker } = DatePicker;

type Role = "ADMIN" | "MANAGER" | "EVM_STAFF" | "DEALER_STAFF";

interface FormValues {
  name: string;
  description?: string;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | "POINT";
  value?: number;
  minValue?: number;
  duration?: [Dayjs, Dayjs];
  dealerIds?: string[];
  electricVehicleIds?: string[];
}

interface PromotionDetail {
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

export default function PromotionEditPage() {
  const [form] = Form.useForm<FormValues>();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const role: Role = (user?.role as Role) ?? "ADMIN";
  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";
  const isEvmStaff = role === "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";

  const canEditTargets = isEvmStaff || isDealerStaff;
  const canPickDealers = isEvmStaff;

  const { data, isLoading } = usePromotionById(paramId);
  const { mutateAsync: updateBasic, isPending: updatingBasic } =
    usePromotionUpdate();
  const { mutateAsync: updateValue, isPending: updatingValue } =
    usePromotionUpdateValue();

  const { data: dealersData, isLoading: loadingDealers } = useDealersQuery(
    {},
    { enabled: canPickDealers }
  );

  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: canEditTargets,
  });

  const promotion = data?.result as PromotionDetail | undefined;

  const dealerOptions = useMemo(
    () => mapDealerOptions(dealersData),
    [dealersData]
  );

  const vehicleOptions = useMemo(
    () => mapVehicleOptions(vehiclesData),
    [vehiclesData]
  );

  const [existingDealerIds, setExistingDealerIds] = useState<string[]>([]);
  const [existingVehicleIds, setExistingVehicleIds] = useState<string[]>([]);

  const findDealerLabel = (id: string) =>
    dealerOptions.find((x) => x.value === id)?.label ?? id;

  const findVehicleLabel = (id: string) =>
    vehicleOptions.find((x) => x.value === id)?.label ?? "Xe không xác định";

  const tagRender =
    (existingIds: string[], findLabel: (id: string) => string) =>
    (props: CustomTagProps) => {
      const { value, closable, onClose } = props;
      const stringValue = String(value);
      const isOld = existingIds.includes(stringValue);

      return (
        <Tag
          color={isOld ? "default" : "blue"}
          closable={!isOld && closable}
          onClose={isOld ? (e) => e.preventDefault() : onClose}
        >
          {findLabel(stringValue)}
        </Tag>
      );
    };

  useEffect(() => {
    if (!promotion) return;

    const dealers = promotion.dealerIds ?? [];
    const vehicles = promotion.vehicleIds ?? [];

    setExistingDealerIds(dealers);
    setExistingVehicleIds(vehicles);

    let duration: [Dayjs, Dayjs] | undefined;
    if (promotion.startDate && promotion.endDate) {
      duration = [dayjs(promotion.startDate), dayjs(promotion.endDate)];
    }

    form.setFieldsValue({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type ?? "PERCENTAGE",
      value: promotion.value,
      minValue: promotion.minValue,
      duration,
      dealerIds: dealers,
      electricVehicleIds: vehicles,
    });
  }, [promotion, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!paramId) {
      toast.error("Thiếu ID khuyến mãi");
      return;
    }

    try {
      const [start, end] = values.duration ?? [];

      const addedDealers = (values.dealerIds ?? []).filter(
        (x) => !existingDealerIds.includes(x)
      );

      const addedVehicles = (values.electricVehicleIds ?? []).filter(
        (x) => !existingVehicleIds.includes(x)
      );

      const basePayload = {
        name: values.name,
        description: values.description,
        dealerIds: isDealerStaff ? [] : addedDealers,
        electricVehicleIds: addedVehicles,
      };

      if (canEditTargets) {
        await updateBasic({ id: paramId, data: basePayload });
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
      toast.error("Cập nhật không thành công!");
    }
  };

  if (isLoading || loadingDealers || loadingVehicles) {
    return (
      <div className="flex justify-center mt-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <CardWrapper>
      <Button
        onClick={() => navigate(-1)}
        className="!mb-5 !bg-[#627254] !text-white !border-[#627254]"
      >
        Quay lại
      </Button>

      <Form<FormValues> form={form} layout="vertical" onFinish={handleSubmit}>
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
                className="!rounded-lg"
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
            <Form.Item label="Giá trị" name="value">
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
                  options={dealerOptions}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Mẫu xe áp dụng" name="electricVehicleIds">
                <Select
                  mode="multiple"
                  tagRender={tagRender(existingVehicleIds, findVehicleLabel)}
                  options={vehicleOptions}
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
                className="!w-full"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                rows={3}
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
            className="!bg-[#627254] !border-[#627254] !text-white"
          >
            Cập nhật khuyến mãi
          </Button>
        </Form.Item>
      </Form>
    </CardWrapper>
  );
}
