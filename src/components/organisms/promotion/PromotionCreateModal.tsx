// src/components/organisms/promotion/PromotionCreateModal.tsx
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Spin,
  Typography,
  Space,
} from "antd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import type { RootState } from "../../../redux/store";
import type { Role } from "../../../utils/promotionPermissions";

import { usePromotionCreate } from "../../../service/promotionService";
import { useGetVehicles } from "../../../service/vehicleService";
import { useDealersQuery } from "../../../service/dealerService";
import {
  mapDealerOptions,
  mapVehicleOptions,
} from "../../../utils/mapToSelectOptions";
import { DeleteConfirm } from "../DeleteConfirm";

const { Title } = Typography;

interface PromotionFormValues {
  dealerId?: string[];
  electricVehiclesId: string[];
  name: string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PromotionCreateModal = ({ open, onClose }: Props) => {
  const [form] = Form.useForm<PromotionFormValues>();
  const baselineRef = useRef<PromotionFormValues | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const user = useSelector((s: RootState) => s.user ?? {}) as Partial<{
    id: string;
    dealerId: string;
    role: Role;
  }>;

  const role = user.role ?? "EVM_STAFF";
  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";
  const isAdmin = role === "ADMIN";

  const canFetchDealers = isEvmStaff || isAdmin;

  const { mutateAsync: createPromotion, isPending } = usePromotionCreate();

  const { data: dealersData, isLoading: loadingDealers } = useDealersQuery(
    0,
    1000,
    "",
    "createdAt",
    "desc",
    undefined,
    undefined,
    canFetchDealers
  );

  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles({
    enabled: true,
  });

  const [dealerOptions, setDealerOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [mappingDone, setMappingDone] = useState(false);

  useEffect(() => {
    setVehicleOptions(mapVehicleOptions(vehiclesData));

    if (dealersData && canFetchDealers) {
      setDealerOptions(mapDealerOptions(dealersData));
    }

    if (vehiclesData || (dealersData && canFetchDealers)) {
      setMappingDone(true);
    }
  }, [dealersData, vehiclesData, canFetchDealers]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      baselineRef.current = null;
      return;
    }

    form.resetFields();
    if (isDealerStaff && user.dealerId) {
      form.setFieldsValue({ dealerId: [user.dealerId] });
    }

    const id = setTimeout(() => {
      baselineRef.current = form.getFieldsValue();
    }, 0);

    return () => clearTimeout(id);
  }, [open, isDealerStaff, user.dealerId, form]);

  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const payload = {
        dealerId: isDealerStaff ? [user.dealerId!] : values.dealerId ?? [],
        electricVehiclesId: values.electricVehiclesId,
        name: values.name.trim(),
        description: values.description?.trim() || "",
      };

      await createPromotion(payload);
      toast.success("Tạo khuyến mãi thành công!");
      onClose();
    } catch {
      toast.error("Tạo khuyến mãi thất bại!");
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

  const loading = !mappingDone || loadingDealers || loadingVehicles;

  return (
    <>
      <Modal
        open={open}
        onCancel={handleRequestClose}
        footer={null}
        width={650}
      >
        {loading ? (
          <div className="flex justify-center mt-10 mb-6">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Space style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, color: "#627254" }}>
                Tạo khuyến mãi mới
              </Title>
            </Space>

            <Form<PromotionFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              {!isDealerStaff && (
                <Form.Item label="Áp dụng cho đại lý" name="dealerId">
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Bỏ trống để tạo khuyến mãi GLOBAL"
                    options={dealerOptions}
                  />
                </Form.Item>
              )}

              <Form.Item
                label="Xe điện áp dụng"
                name="electricVehiclesId"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một xe điện",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn xe điện"
                  options={vehicleOptions}
                />
              </Form.Item>

              <Form.Item
                label="Tên khuyến mãi"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khuyến mãi" },
                ]}
              >
                <Input placeholder="VD: Giảm giá 10%" />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea
                  rows={3}
                  style={{ resize: "none", borderRadius: 8 }}
                />
              </Form.Item>

              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPending}
                  className="!bg-[#627254] !border-[#627254] !text-white"
                >
                  Tạo khuyến mãi
                </Button>
              </div>
            </Form>
          </>
        )}
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
};

export default PromotionCreateModal;
