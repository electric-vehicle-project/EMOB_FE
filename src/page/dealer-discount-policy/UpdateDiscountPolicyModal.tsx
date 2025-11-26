/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Form, InputNumber, DatePicker, Spin } from "antd";
import dayjs from "dayjs";
import {
  useUpdateDiscountPolicy,
  useGetDiscountPolicyById,
  useGetAllDealers,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";
import SelectInput from "../../components/atoms/SelectInput";
import type { IVehicle } from "../../model/Vehicle";
import { toast } from "react-toastify";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";

const { RangePicker } = DatePicker;

interface UpdateDiscountPolicyModalProps {
  open: boolean;
  policyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateDiscountPolicyModal: React.FC<UpdateDiscountPolicyModalProps> = ({
  open,
  policyId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const initialValuesRef = useRef<any | null>(null);
  const initializedRef = useRef(false);

  // Lấy thông tin chi tiết chính sách
  const { data: policyData, isLoading: loadingPolicy } =
    useGetDiscountPolicyById(policyId, {
      enabled: !!policyId && open,
    });

  // Lấy danh sách Dealers & Vehicles
  const { data: dealersData, isLoading: loadingDealers } = useGetAllDealers(
    0,
    100
  );
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles(
    0,
    100
  );

  const { mutateAsync: updatePolicy, isPending } = useUpdateDiscountPolicy();

  const dealerOptions = useMemo(() => {
    const dealers = dealersData?.result?.data || [];
    return dealers.map((d: any) => ({
      label: d.name || d.dealerName || "Không rõ tên",
      value: d.id,
    }));
  }, [dealersData]);

  const vehicleOptions = useMemo(() => {
    const vehicles = vehiclesData?.result?.data || [];
    return vehicles.map((v: IVehicle) => ({
      label: `${v.model} (${v.type})`,
      value: v.id,
    }));
  }, [vehiclesData]);

  // Reset state khi mở modal
  useEffect(() => {
    if (open) {
      initializedRef.current = false;
      setConfirmOpen(false);
      form.resetFields();
      initialValuesRef.current = null;
    }
  }, [open, form]);

  // Khi có dữ liệu chính sách → fill form + chụp trạng thái ban đầu
  useEffect(() => {
    if (open && policyData?.result && !initializedRef.current) {
      const policy = policyData.result;
      form.setFieldsValue({
        customMultiplier: policy.customMultiplier,
        finalPrice: policy.finalPrice,
        dealerId: policy.dealerId,
        vehicleId: policy.vehicleId,
        dateRange: [dayjs(policy.effectiveDate), dayjs(policy.expiryDate)],
      });
      initialValuesRef.current = form.getFieldsValue(true);
      initializedRef.current = true;
    }
  }, [open, policyData, form]);

  const isDirty = () => {
    if (!initializedRef.current || !initialValuesRef.current) return false;
    const current = form.getFieldsValue(true);
    return JSON.stringify(current) !== JSON.stringify(initialValuesRef.current);
  };

  const requestClose = () => {
    if (!isDirty()) {
      onClose();
      return;
    }
    setConfirmOpen(true);
  };

  const handleDiscard = () => {
    form.resetFields();
    setConfirmOpen(false);
    onClose();
  };

  // Submit cập nhật
  const handleSubmit = async (values: any) => {
    const payload = {
      customMultiplier: values.customMultiplier,
      finalPrice: values.finalPrice,
      effectiveDate: values.dateRange[0].format("YYYY-MM-DD"),
      expiryDate: values.dateRange[1].format("YYYY-MM-DD"),
      dealerId: values.dealerId,
      vehicleId: values.vehicleId,
    };

    try {
      await updatePolicy({ id: policyId, data: payload });
      toast.success("Cập nhật chính sách chiết khấu thành công!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Cập nhật chính sách thất bại!"
      );
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={requestClose}
        onOk={() => form.submit()}
        confirmLoading={isPending}
        title="Cập nhật chính sách chiết khấu"
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
        destroyOnClose={false}
        maskClosable
      >
        {loadingPolicy ? (
          <div className="flex justify-center py-8">
            <Spin tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <SelectInput
              label="Đại lý"
              name="dealerId"
              placeholder="Chọn đại lý"
              options={dealerOptions}
              loading={loadingDealers}
              rules={[{ required: true, message: "Vui lòng chọn đại lý" }]}
            />

            <SelectInput
              label="Xe"
              name="vehicleId"
              placeholder="Chọn xe"
              options={vehicleOptions}
              loading={loadingVehicles}
              rules={[{ required: true, message: "Vui lòng chọn xe" }]}
            />

            <Form.Item
              label="Hệ số chiết khấu"
              name="customMultiplier"
              rules={[{ required: true, message: "Vui lòng nhập hệ số" }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: "100%" }}
                placeholder="Ví dụ: 1.05"
              />
            </Form.Item>

            <Form.Item
              label="Giá cuối cùng (VND)"
              name="finalPrice"
              rules={[{ required: false, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                placeholder="Nhập giá cuối cùng"
              />
            </Form.Item>

            <Form.Item
              label="Thời gian hiệu lực"
              name="dateRange"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian hiệu lực",
                },
              ]}
            >
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <DeleteConfirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDiscard}
        title="Hủy thay đổi?"
        message="Các thông tin đã chỉnh sửa sẽ bị xóa. Bạn có chắc chắn muốn hủy?"
        okText="Hủy thay đổi"
        danger
      />
    </>
  );
};

export default UpdateDiscountPolicyModal;
