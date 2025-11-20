/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { Modal, Form, Select, InputNumber, DatePicker, Card } from "antd";
import {
  useCreateBulkDiscountPolicy,
  useGetAllDealers,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";
import type { IDealer } from "../../model/Dealer";
import { toast } from "react-toastify";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";

const { RangePicker } = DatePicker;

interface CreateDiscountPolicyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateDiscountPolicyModal: React.FC<CreateDiscountPolicyModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const createMutation = useCreateBulkDiscountPolicy();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const initialValuesRef = useRef<any | null>(null);

  // Fetch dealers and vehicles
  const { data: dealersData, isLoading: loadingDealers } = useGetAllDealers(
    0,
    1000
  );
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles(
    0,
    1000
  );

  const dealers = dealersData?.result?.data || [];
  const vehicles = vehiclesData?.result?.data || [];

  // Ghi nhận trạng thái form ban đầu khi mở modal
  useEffect(() => {
    if (open) {
      form.resetFields();
      setConfirmOpen(false);
      initialValuesRef.current = form.getFieldsValue(true);
    }
  }, [open, form]);

  const isDirty = () => {
    if (!initialValuesRef.current) return false;
    const current = form.getFieldsValue(true);
    return JSON.stringify(current) !== JSON.stringify(initialValuesRef.current);
  };

  const handleRequestClose = () => {
    if (isDirty()) {
      setConfirmOpen(true);
      return;
    }
    form.resetFields();
    onClose();
  };

  const handleDiscard = () => {
    form.resetFields();
    setConfirmOpen(false);
    onClose();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        dealerIds: values.dealerIds,
        vehicleModelIds: values.vehicleModelIds,
        customMultiplier: values.customMultiplier,
        finalPrice: values.finalPrice,
        effectiveDate: values.dateRange[0].format("YYYY-MM-DD"),
        expiredDate: values.dateRange[1].format("YYYY-MM-DD"),
      };

      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Tạo chính sách chiết khấu thành công!");
          form.resetFields();
          onClose();
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Tạo chính sách thất bại"
          );
        },
      });
    } catch {
      // validateFields fail -> không đóng modal
      // console.error("Validation failed:", error);
    }
  };

  return (
    <>
      <Modal
        title="Tạo chính sách chiết khấu mới"
        open={open}
        onOk={handleOk}
        onCancel={handleRequestClose}
        width={700}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
        destroyOnClose={false}
        maskClosable
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{
            customMultiplier: 1.05,
          }}
        >
          <Card className="mb-4" size="small" title="Chọn các đại lý">
            <Form.Item
              name="dealerIds"
              label="Danh sách đại lý"
              rules={[
                { required: true, message: "Vui lòng chọn ít nhất 1 đại lý!" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn đại lý"
                loading={loadingDealers}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={dealers.map((dealer: IDealer) => ({
                  label: `${dealer.name}`,
                  value: dealer.id,
                }))}
              />
            </Form.Item>
          </Card>

          <Card className="mb-4" size="small" title="Chọn các mẫu xe">
            <Form.Item
              name="vehicleModelIds"
              label="Danh sách mẫu xe"
              rules={[
                { required: true, message: "Vui lòng chọn ít nhất 1 mẫu xe!" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn mẫu xe"
                loading={loadingVehicles}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={vehicles.map((vehicle: any) => ({
                  label: `${vehicle.model}`,
                  value: vehicle.id,
                }))}
              />
            </Form.Item>
          </Card>

          <Card className="mb-4" size="small" title="Thông tin chính sách">
            <Form.Item
              name="customMultiplier"
              label="Hệ số chiết khấu"
              rules={[{ required: true, message: "Vui lòng nhập hệ số!" }]}
              tooltip="Ví dụ: 1.05 = tăng giá 5%, 0.95 = giảm giá 5%"
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                placeholder="Nhập hệ số (ví dụ: 1.05)"
              />
            </Form.Item>

            <Form.Item name="finalPrice" label="Giá cuối cùng (VND)">
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
              name="dateRange"
              label="Thời gian hiệu lực"
              rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
            >
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              />
            </Form.Item>
          </Card>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Lưu ý:</strong> Chính sách sẽ được tạo cho{" "}
              <strong>tất cả các tổ hợp</strong> giữa dealers và vehicles đã
              chọn.
            </p>
          </div>
        </Form>
      </Modal>

      <DeleteConfirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDiscard}
        title="Hủy tạo chính sách?"
        message="Các thông tin đã nhập sẽ bị xoá. Bạn có chắc chắn muốn hủy?"
        okText="Hủy thay đổi"
        danger
      />
    </>
  );
};

export default CreateDiscountPolicyModal;
