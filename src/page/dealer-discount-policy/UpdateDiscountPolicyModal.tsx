import React, { useEffect, useMemo } from "react";
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

  //  Hook cập nhật
  const { mutateAsync: updatePolicy, isPending } = useUpdateDiscountPolicy();

  // Chuyển dữ liệu thành Select options
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

  // Khi có dữ liệu chính sách, fill form
  useEffect(() => {
    if (policyData?.result) {
      const policy = policyData.result;
      form.setFieldsValue({
        customMultiplier: policy.customMultiplier,
        finalPrice: policy.finalPrice,
        dealerId: policy.dealerId,
        vehicleId: policy.vehicleId,
        dateRange: [dayjs(policy.effectiveDate), dayjs(policy.expiryDate)],
      });
    }
  }, [policyData, form]);

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
      toast.success(" Cập nhật chính sách chiết khấu thành công!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || " Cập nhật chính sách thất bại!"
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isPending}
      title="Cập nhật chính sách chiết khấu"
      okText="Cập nhật"
      cancelText="Hủy"
      width={600}
      destroyOnClose
    >
      {loadingPolicy ? (
        <div className="flex justify-center py-8">
          <Spin tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          {/* Dealer */}
          <SelectInput
            label="Đại lý"
            name="dealerId"
            placeholder="Chọn đại lý"
            options={dealerOptions}
            loading={loadingDealers}
            rules={[{ required: true, message: "Vui lòng chọn đại lý" }]}
          />

          {/* Vehicle */}
          <SelectInput
            label="Xe"
            name="vehicleId"
            placeholder="Chọn xe"
            options={vehicleOptions}
            loading={loadingVehicles}
            rules={[{ required: true, message: "Vui lòng chọn xe" }]}
          />

          {/*  Custom Multiplier */}
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

          {/*  Final Price */}
          <Form.Item
            label="Giá cuối cùng (VND)"
            name="finalPrice"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
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

          {/* Date Range */}
          <Form.Item
            label="Thời gian hiệu lực"
            name="dateRange"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian hiệu lực" },
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
  );
};

export default UpdateDiscountPolicyModal;
