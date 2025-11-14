import React, { useMemo } from "react";
import { Form, Button, Modal, Input, Space, Divider } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { IQuotationItem } from "../../model/Quotation";
import SelectInput from "../../components/atoms/SelectInput";
import NumberInput from "../../components/atoms/NumberInput";
import { useCreateQuotation } from "../../service/quotationService";
import { useCustomerList } from "../../service/customerService";
import { usePromotionList } from "../../service/promotionService";
import { useGetVehicles } from "../../service/vehicleService";
import { toast } from "react-toastify";

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

  // Submit form
  const handleSubmit = async (values: any) => {
    try {
      const payload: CreateQuotationPayload = {
        items: (values.items || []).map((item: any) => ({
          vehicleId: item.vehicleId,
          promotionId: item.promotionId || null,
          vehicleStatus: item.vehicleStatus,
          color: item.color,
          quantity: item.quantity,
        })),
        customerId: values.customerId,
        validUntil: values.validUntil,
      };

      await createQuotation(payload);
      toast.success("Tạo báo giá thành công!");
      form.resetFields();
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Create quotation error:", error);
      toast.error(
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
      width={700}
      title={<span className="text-lg font-semibold">Tạo báo giá mới</span>}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* Khách hàng */}
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

        {/* Danh sách xe */}
        <Divider orientation="left">Danh sách xe báo giá</Divider>

        <Form.List name="items" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="border p-4 rounded-lg mb-4 bg-gray-50 relative"
                >
                  <Space
                    direction="vertical"
                    size="middle"
                    className="w-full"
                    key={name}
                  >
                    <SelectInput
                      label="Xe"
                      name={[name, "vehicleId"]}
                      placeholder="Chọn xe"
                      options={vehicleOptions}
                      loading={loadingVehicles}
                      showSearch
                      rules={[{ required: true, message: "Chọn xe" }]}
                    />

                    <SelectInput
                      label="Khuyến mãi"
                      name={[name, "promotionId"]}
                      placeholder="Chọn khuyến mãi (nếu có)"
                      options={promotionOptions}
                      loading={loadingPromotions}
                    />

                    <SelectInput
                      label="Trạng thái xe"
                      name={[name, "vehicleStatus"]}
                      options={[
                        { label: "Bình thường", value: "NORMAL" },
                        { label: "Đặc biệt", value: "SPECIAL" },
                        { label: "Xe lái thử", value: "TEST_DRIVE" },
                        { label: "Đã đặt trước", value: "RESERVED" },
                        { label: "Tồn kho cũ", value: "OLD_STOCK" },
                        { label: "Đã bán", value: "SOLD" },
                      ]}
                      rules={[
                        { required: true, message: "Chọn trạng thái xe" },
                      ]}
                    />

                    <Form.Item
                      {...restField}
                      label="Màu sắc"
                      name={[name, "color"]}
                      rules={[{ required: true, message: "Nhập màu xe" }]}
                    >
                      <Input placeholder="Ví dụ: Đen, Trắng, Xanh rêu..." />
                    </Form.Item>

                    <NumberInput
                      label="Số lượng"
                      name={[name, "quantity"]}
                      min={1}
                      placeholder="Nhập số lượng"
                      rules={[{ required: true, message: "Nhập số lượng" }]}
                    />
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined />}
                      danger
                      onClick={() => remove(name)}
                    >
                      Xóa xe này
                    </Button>
                  </Space>
                </div>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  block
                >
                  Thêm xe khác
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Thời hạn hiệu lực */}
        <NumberInput
          label="Thời hạn hiệu lực (ngày)"
          name="validUntil"
          min={1}
          placeholder="Nhập số ngày hiệu lực"
          rules={[{ required: true, message: "Thời hạn hiệu lực là bắt buộc" }]}
        />

        {/* Nút hành động */}
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
