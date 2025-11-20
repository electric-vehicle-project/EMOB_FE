// src/components/organisms/promotion/PromotionEditModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Card,
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
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";

import {
  usePromotionById,
  usePromotionUpdate,
  usePromotionUpdateValue,
} from "../../../service/promotionService";
import { useGetVehicles } from "../../../service/vehicleService";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../../utils/mapToSelectOptions";
import { useDealersQuery } from "../../../service/dealerService";
import { toast } from "react-toastify";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import { DeleteConfirm } from "../DeleteConfirm";

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

interface Props {
  open: boolean;
  onClose: () => void;
  promotionId?: string;
  onSuccess?: () => void;
}

export default function PromotionEditModal({
  open,
  onClose,
  promotionId,
  onSuccess,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const baselineRef = useRef<FormValues | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const user = useSelector((state: RootState) => state.user);

  const role: Role =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "EVM_STAFF" ||
    user?.role === "DEALER_STAFF"
      ? (user.role as Role)
      : "DEALER_STAFF";

  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";
  const isEvmStaff = role === "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";

  const canEditTargets = isEvmStaff || isDealerStaff;
  const canPickDealers = isEvmStaff;

  const { data, isLoading } = usePromotionById(promotionId || "");
  const { mutateAsync: updateBasic, isPending: updatingBasic } =
    usePromotionUpdate();
  const { mutateAsync: updateValue, isPending: updatingValue } =
    usePromotionUpdateValue();

  const { data: dealersData, isLoading: loadingDealers } = useDealersQuery(
    0,
    1000,
    "",
    "createdAt",
    "desc",
    undefined,
    canPickDealers
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
      const { value, closable, onClose: onTagClose } = props;
      const stringValue = String(value);
      const isOld = existingIds.includes(stringValue);

      return (
        <Tag
          color={isOld ? "default" : "blue"}
          closable={!isOld && closable}
          onClose={isOld ? (e) => e.preventDefault() : onTagClose}
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

  useEffect(() => {
    if (!open || !promotion) {
      if (!open) baselineRef.current = null;
      return;
    }

    const id = setTimeout(() => {
      baselineRef.current = form.getFieldsValue();
    }, 0);

    return () => clearTimeout(id);
  }, [open, promotion, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!promotionId) {
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
        await updateBasic({ id: promotionId, data: basePayload });
      }

      if (isManager || isAdmin) {
        await updateValue({
          id: promotionId,
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
      onClose();
      onSuccess?.();
    } catch {
      toast.error("Cập nhật không thành công!");
    }
  };

  const handleRequestClose = () => {
    const baseline = baselineRef.current ?? form.getFieldsValue();
    const current = form.getFieldsValue();

    const hasChanges = JSON.stringify(current) !== JSON.stringify(baseline);

    if (!hasChanges) {
      onClose();
      return;
    }

    setConfirmVisible(true);
  };

  const handleConfirmDiscard = () => {
    setConfirmVisible(false);
    form.resetFields();
    onClose();
  };

  const handleCancelDiscard = () => {
    setConfirmVisible(false);
  };

  const loading = isLoading || loadingDealers || loadingVehicles;

  return (
    <>
      <Modal
        open={open}
        onCancel={handleRequestClose}
        footer={null}
        width={900}
        destroyOnClose
      >
        <h2 className="text-xl font-semibold text-[#627254] mb-4">
          Cập nhật khuyến mãi
        </h2>

        <Card bordered>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spin size="large" />
            </div>
          ) : (
            <Form<FormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              key={promotionId}
            >
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
                        {
                          label: "Giảm theo phần trăm (%)",
                          value: "PERCENTAGE",
                        },
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
                        tagRender={tagRender(
                          existingDealerIds,
                          findDealerLabel
                        )}
                        options={dealerOptions}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Mẫu xe áp dụng" name="electricVehicleIds">
                      <Select
                        mode="multiple"
                        tagRender={tagRender(
                          existingVehicleIds,
                          findVehicleLabel
                        )}
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

              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updatingBasic || updatingValue}
                  className="!bg-[#627254] !border-[#627254] !text-white"
                >
                  Cập nhật khuyến mãi
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </Modal>

      <DeleteConfirm
        open={confirmVisible}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
        message="Các thay đổi sẽ không được lưu. Bạn có chắc chắn muốn hủy?"
        okText="Bỏ thay đổi"
        danger={false}
        title="Xác nhận hủy"
      />
    </>
  );
}
