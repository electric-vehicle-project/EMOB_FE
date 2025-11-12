import React, { useEffect, useMemo } from "react";
import { Form, Button, message, Modal, Spin } from "antd";
import type { IQuotationItem } from "../../model/Quotation";
import SelectInput from "../../components/atoms/SelectInput";
import NumberInput from "../../components/atoms/NumberInput";
import {
  useGetQuotationById,
  useUpdateQuotation,
} from "../../service/quotationService";
import { usePromotionList } from "../../service/promotionService";
import { useCustomerList } from "../../service/customerService";
import { useGetVehicles } from "../../service/vehicleService";
import { toast } from "react-toastify";

export interface UpdateQuotationPayload {
  items: IQuotationItem[];
  customerId: string;
  validUntil: number;
}

export interface UpdateQuotationModalProps {
  open?: boolean;
  quotationId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const UpdateQuotationModal: React.FC<UpdateQuotationModalProps> = ({
  open,
  quotationId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  /** Hook lấy chi tiết báo giá */
  const { data: quotationData, isLoading: isFetching } = useGetQuotationById(
    quotationId!,
    {
      enabled: !!quotationId && open,
    }
  );

  /** Hook cập nhật báo giá */
  const { mutateAsync: updateQuotation, isPending } = useUpdateQuotation();

  /** Fetch danh sách từ API */
  const { data: customersData, isLoading: loadingCustomers } = useCustomerList(
    0,
    100
  );
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles(
    0,
    100
  );
  const { data: promotionsData, isLoading: loadingPromotions } =
    usePromotionList("", 0, 100);

  /** Chuyển đổi data thành options cho Select */
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
      label: `${vehicle.model} (${vehicle.type})`,
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

  /** Khi dữ liệu có, fill vào form */
  useEffect(() => {
    if (quotationData?.result) {
      const quotation = quotationData.result;
      const item = quotation.items?.[0] || {};

      form.setFieldsValue({
        itemId: item.id,
        vehicleId: item.vehicleId,
        promotionId: item.promotionId || "",
        vehicleStatus: item.vehicleStatus,
        color: item.color,
        quantity: item.quantity,
        customerId: quotation.customerId,
        validUntil: quotation.validUntil,
      });
    }
  }, [quotationData, form]);

  /** 🔹 Submit form */
  const handleSubmit = async (values: any) => {
    const payload: UpdateQuotationPayload = {
      items: [
        {
          id: values.itemId,
          vehicleId: values.vehicleId,
          promotionId: values.promotionId || null,
          vehicleStatus: values.vehicleStatus,
          color: values.color,
          quantity: values.quantity,
        },
      ],
      customerId: values.customerId,
      validUntil: values.validUntil,
    };

    try {
      await updateQuotation({ id: quotationId, data: payload });
      toast.success("Cập nhật báo giá thành công!");
      form.resetFields();
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Update quotation error:", error);
      toast.error(
        error?.response?.data?.message || "Cập nhật báo giá thất bại."
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
      title={<span className="text-lg font-semibold">Cập nhật báo giá</span>}
    >
      {isFetching ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
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

          {/* 🔹 Chọn xe */}
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
          <SelectInput
            label="Màu sắc"
            name="color"
            placeholder="Chọn màu xe"
            options={[
              { label: "Đen", value: "BLACK" },
              { label: "Trắng", value: "WHITE" },
              { label: "Đỏ", value: "RED" },
              { label: "Xanh dương", value: "BLUE" },
              { label: "Bạc", value: "SILVER" },
              { label: "Xám", value: "GRAY" },
              { label: "Vàng", value: "YELLOW" },
              { label: "Cam", value: "ORANGE" },
            ]}
            rules={[{ required: true, message: "Vui lòng chọn màu xe" }]}
          />

          {/* 🔹 Số lượng */}
          <NumberInput
            label="Số lượng"
            name="quantity"
            min={1}
            placeholder="Nhập số lượng"
            rules={[{ required: true, message: "Số lượng là bắt buộc" }]}
          />

          {/* 🔹 Thời hạn hiệu lực */}
          <NumberInput
            label="Thời hạn hiệu lực (ngày)"
            name="validUntil"
            min={0}
            placeholder="Nhập số ngày hiệu lực"
            rules={[
              { required: true, message: "Thời hạn hiệu lực là bắt buộc" },
            ]}
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Cập nhật
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateQuotationModal;
