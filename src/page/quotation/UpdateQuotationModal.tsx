import React, { useEffect, useMemo } from "react";
import { Form, Button, message, Modal, Spin, Input } from "antd";
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
    { enabled: !!quotationId && open }
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
      form.setFieldsValue({
        customerId: quotation.customerId,
        validUntil: quotation.validUntil,
        items: quotation.items?.map((item: any) => ({
          id: item.id,
          vehicleId: item.vehicleId,
          promotionId: item.promotionId || "",
          vehicleStatus: item.vehicleStatus,
          color: item.color,
          quantity: item.quantity,
        })),
      });
    }
  }, [quotationData, form]);

  /** 🔹 Submit form */
  const handleSubmit = async (values: any) => {
    const payload: UpdateQuotationPayload = {
      items: values.items.map((item: any) => ({
        id: item.id,
        vehicleId: item.vehicleId,
        promotionId: item.promotionId || null,
        vehicleStatus: item.vehicleStatus,
        color: item.color,
        quantity: item.quantity,
      })),
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
      width={900}
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
          className="max-w-3xl"
        >
          {/* 🔹 Khách hàng & thời hạn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Khách hàng"
              name="customerId"
              placeholder="Chọn khách hàng"
              options={customerOptions}
              loading={loadingCustomers}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
            />

            <NumberInput
              label="Thời hạn hiệu lực (ngày)"
              name="validUntil"
              min={0}
              placeholder="Nhập số ngày hiệu lực"
              rules={[
                { required: true, message: "Thời hạn hiệu lực là bắt buộc" },
              ]}
            />
          </div>

          {/* Danh sách các item */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg bg-gray-50 mt-4"
                  >
                    <SelectInput
                      {...restField}
                      name={[name, "vehicleId"]}
                      label="Xe"
                      placeholder="Chọn xe"
                      options={vehicleOptions}
                      loading={loadingVehicles}
                      rules={[{ required: true, message: "Vui lòng chọn xe" }]}
                    />

                    <SelectInput
                      {...restField}
                      name={[name, "promotionId"]}
                      label="Khuyến mãi"
                      placeholder="Chọn khuyến mãi (nếu có)"
                      options={promotionOptions}
                      loading={loadingPromotions}
                    />

                    <SelectInput
                      {...restField}
                      name={[name, "vehicleStatus"]}
                      label="Trạng thái"
                      placeholder="Chọn trạng thái"
                      options={[
                        { label: "Bình thường", value: "NORMAL" },
                        { label: "Đặc biệt", value: "SPECIAL" },
                        { label: "Xe lái thử", value: "TEST_DRIVE" },
                        { label: "Đặt trước", value: "RESERVED" },
                        { label: "Tồn kho cũ", value: "OLD_STOCK" },
                        { label: "Đã bán", value: "SOLD" },
                      ]}
                      rules={[
                        { required: true, message: "Chọn trạng thái xe" },
                      ]}
                    />

                    <Form.Item
                      {...restField}
                      name={[name, "color"]}
                      label="Màu sắc"
                      rules={[{ required: true, message: "Nhập màu xe" }]}
                    >
                      <Input placeholder="Nhập màu xe" />
                    </Form.Item>

                    <NumberInput
                      {...restField}
                      name={[name, "quantity"]}
                      label="Số lượng"
                      min={1}
                      rules={[{ required: true, message: "Nhập số lượng" }]}
                    />

                    <div className="flex items-end justify-end">
                      {fields.length > 1 && (
                        <Button danger onClick={() => remove(name)}>
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Nút thêm item */}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  className="mt-3 border-[#627254] text-[#627254]"
                >
                  + Thêm xe vào báo giá
                </Button>
              </>
            )}
          </Form.List>

          {/* 🔹 Footer */}
          <div className="flex justify-end gap-3 mt-6">
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
