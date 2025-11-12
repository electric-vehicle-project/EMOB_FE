import React, { useMemo } from "react";
import { Form, Button, message, Modal, Input } from "antd";
import type { IQuotationItem } from "../../model/Quotation";
import SelectInput from "../../components/atoms/SelectInput";
import NumberInput from "../../components/atoms/NumberInput";
import { useCreateQuotation } from "../../service/quotationService";
import { useCustomerList } from "../../service/customerService";
import { usePromotionList } from "../../service/promotionService";
import { useGetVehicles } from "../../service/vehicleService";

export interface CreateQuotationPayload {
  items: IQuotationItem[];
  customerId: string;
  validUntil: number;
}

export interface CreateQuotationPageProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const CreateQuotationPage: React.FC<CreateQuotationPageProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { mutateAsync: createQuotation, isPending } = useCreateQuotation();

  // Fetch danh sách từ API
  const { data: customersData, isLoading: loadingCustomers } =
    useCustomerList();
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles();
  const { data: promotionsData, isLoading: loadingPromotions } =
    usePromotionList("", 0, 100);

  // Chuyển đổi data thành options cho Select
  const customerOptions = useMemo(() => {
    const customers = customersData?.result?.data || [];
    return customers.map((customer: any) => ({
      label: `${customer.fullName} - ${customer.phoneNumber || customer.email}`,
      value: customer.id,
    }));
  }, [customersData]);

  const vehicleOptions = useMemo(() => {
    const vehicles = vehiclesData?.result?.data || [];
    return vehicles.map((vehicle: any) => ({
      label: vehicle.model,
      value: vehicle.id,
    }));
  }, [vehiclesData]);

  const promotionOptions = useMemo(() => {
    const promotions = promotionsData?.result?.data || [];
    return [
      { label: "Không áp dụng", value: "" },
      ...promotions.map((promo: any) => ({
        label: `${promo.name} - Giảm ${promo.value}`,
        value: promo.id,
      })),
    ];
  }, [promotionsData]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: CreateQuotationPayload = {
        items: [
          {
            vehicleId: values.vehicleId,
            promotionId: values.promotionId || null,
            vehicleStatus: values.vehicleStatus,
            color: values.color,
            quantity: values.quantity,
          },
        ],
        customerId: values.customerId,
        validUntil: values.validUntil
          ? new Date(values.validUntil).getTime()
          : 0,
      };

      await createQuotation(payload);

      message.success("Tạo báo giá thành công!");
      form.resetFields();

      if (onSuccess) {
        await onSuccess();
      }
      onClose?.();
    } catch (error: any) {
      console.error("Create quotation error:", error);
      message.error(
        error?.response?.data?.message ||
          "Tạo báo giá thất bại, vui lòng thử lại."
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width={600}
      title={<span className="text-lg font-semibold">Tạo báo giá mới</span>}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="max-w-2xl"
      >
        {/* Chọn khách hàng */}
        <SelectInput
          label="Khách hàng"
          name="customerId"
          placeholder="Chọn khách hàng"
          options={customerOptions}
          loading={loadingCustomers}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
        />

        {/* Chọn xe */}
        <SelectInput
          label="Xe"
          name="vehicleId"
          placeholder="Chọn xe"
          options={vehicleOptions}
          loading={loadingVehicles}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          rules={[{ required: true, message: "Vui lòng chọn xe" }]}
        />

        {/* 🔹 Chọn khuyến mãi */}
        <SelectInput
          label="Khuyến mãi"
          name="promotionId"
          placeholder="Chọn khuyến mãi (nếu có)"
          options={promotionOptions}
          loading={loadingPromotions}
          showSearch
        />

        {/* 🔹 Trạng thái xe */}
        <SelectInput
          label="Trạng thái xe"
          name="vehicleStatus"
          placeholder="Chọn trạng thái xe"
          options={[
            { label: "Bình thường", value: "NORMAL" },
            { label: "Đặc biệt", value: "SPECIAL" },
            { label: "Xe lái thử", value: "TEST_DRIVE" },
            { label: "Đã đặt trước", value: "RESERVED" },
            { label: "Tồn kho cũ", value: "OLD_STOCK" },
            { label: "Đã bán", value: "SOLD" },
          ]}
          rules={[{ required: true, message: "Hãy chọn trạng thái xe" }]}
        />

        {/* 🔹 Màu sắc */}
        <Form.Item
          label="Màu sắc"
          name="color"
          rules={[{ required: true, message: "Vui lòng nhập màu xe" }]}
        >
          <Input placeholder="Nhập màu xe (ví dụ: Đen, Trắng, Xanh rêu...)" />
        </Form.Item>

        {/* 🔹 Số lượng */}
        <NumberInput
          label="Số lượng"
          name="quantity"
          min={1}
          placeholder="Nhập số lượng xe"
          rules={[{ required: true, message: "Số lượng là bắt buộc" }]}
        />

        {/* 🔹 Thời hạn hiệu lực */}
        <NumberInput
          label="Thời hạn hiệu lực (ngày)"
          name="validUntil"
          min={0}
          placeholder="Nhập số ngày hiệu lực"
          rules={[{ required: true, message: "Thời hạn hiệu lực là bắt buộc" }]}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo báo giá
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateQuotationPage;
