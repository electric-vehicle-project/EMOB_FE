/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { Form, Button, Modal, Spin, Input } from "antd";
import type { NamePath } from "antd/es/form/interface";
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
import { PlusOutlined } from "@ant-design/icons";

export interface UpdateQuotationPayload {
  items: IQuotationItem[];
  customerId: string;
  validUntil: number;
}

export interface UpdateQuotationFormValues {
  customerId: string;
  validUntil: number;
  items: {
    id: string;
    vehicleId: string;
    promotionId: string | null;
    vehicleStatus: string;
    color: string;
    quantity: number;
  }[];
}

export interface UpdateQuotationModalProps {
  open: boolean;
  quotationId: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const UpdateQuotationModal: React.FC<UpdateQuotationModalProps> = ({
  open,
  quotationId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<UpdateQuotationFormValues>();

  const { data: quotationData, isLoading: isFetching } = useGetQuotationById(
    quotationId,
    { enabled: !!quotationId && open }
  );
  // call api update
  const { mutateAsync: updateQuotation, isPending } = useUpdateQuotation();

  const { data: customersData, isLoading: loadingCustomers } = useCustomerList({
    page: 0,
    size: 100,
  });
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles(
    0,
    100
  );
  const { data: promotionsData, isLoading: loadingPromotions } =
    usePromotionList("", 0, 100);
  // select list
  const customerOptions = useMemo(() => {
    return (customersData?.result?.data || []).map((c: any) => ({
      label: `${c.fullName} - ${c.phoneNumber || c.email}`,
      value: c.id,
    }));
  }, [customersData]);

  const vehicleOptions = useMemo(() => {
    return (vehiclesData?.result?.data || []).map((v: any) => ({
      label: `${v.model} (${v.type})`,
      value: v.id,
    }));
  }, [vehiclesData]);

  const promotionOptions = useMemo(() => {
    return [
      { label: "Không áp dụng", value: "" },
      ...(promotionsData?.result?.data || []).map((p: any) => ({
        label: `${p.name} - Giảm ${p.value}`,
        value: p.id,
      })),
    ];
  }, [promotionsData]);

  /** Fill form */
  useEffect(() => {
    if (quotationData?.result) {
      const q = quotationData.result;

      form.setFieldsValue({
        customerId: q.customerId,
        validUntil: q.validUntil,
        items: q.items?.map((item: IQuotationItem) => ({
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

  /** Submit */
  const handleSubmit = async (values: UpdateQuotationFormValues) => {
    const payload: UpdateQuotationPayload = {
      items: values.items.map((item) => ({
        ...item,
        promotionId: item.promotionId || null,
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
          {/* CUSTOMER & VALID UNTIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Khách hàng"
              name="customerId"
              placeholder="Chọn khách hàng"
              options={customerOptions}
              loading={loadingCustomers}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? "")
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
              rules={[{ required: true, message: "Thời hạn là bắt buộc" }]}
            />
          </div>

          {/* ITEMS */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg bg-gray-50 mt-4"
                  >
                    <SelectInput
                      name={[name, "vehicleId"] as NamePath}
                      label="Xe"
                      placeholder="Chọn xe"
                      options={vehicleOptions}
                      loading={loadingVehicles}
                      rules={[{ required: true, message: "Vui lòng chọn xe" }]}
                    />

                    <SelectInput
                      name={[name, "promotionId"] as NamePath}
                      label="Khuyến mãi"
                      placeholder="Chọn khuyến mãi"
                      options={promotionOptions}
                      loading={loadingPromotions}
                    />

                    <SelectInput
                      name={[name, "vehicleStatus"] as NamePath}
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
                      rules={[{ required: true, message: "Chọn trạng thái" }]}
                    />

                    <Form.Item
                      name={[name, "color"] as NamePath}
                      label="Màu sắc"
                      rules={[{ required: true, message: "Nhập màu xe" }]}
                    >
                      <Input placeholder="Nhập màu xe" />
                    </Form.Item>

                    <NumberInput
                      name={[name, "quantity"] as NamePath}
                      label="Số lượng"
                      min={1}
                      rules={[{ required: true, message: "Nhập số lượng" }]}
                    />

                    <div className="flex items-end justify-end">
                      {fields.length > 1 && (
                        <Button
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                          }}
                          onClick={() => remove(name)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                  block
                  className="mt-3 border-[#627254] text-[#627254]"
                >
                  Thêm xe vào báo giá
                </Button>
              </>
            )}
          </Form.List>

          {/* ACTIONS */}
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
