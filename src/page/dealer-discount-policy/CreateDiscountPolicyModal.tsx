import React from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  message,
  Card,
} from "antd";
import {
  useCreateBulkDiscountPolicy,
  useGetAllDealers,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";
import type { IDealer } from "../../model/Dealer";

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

  // Fetch dealers and vehicles cho chọn dealer và vehicle
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
          message.success("Tạo chính sách chiết khấu thành công!");
          form.resetFields();
          onClose();
          onSuccess();
        },
        onError: (error: any) => {
          message.error(
            error?.response?.data?.message || "Tạo chính sách thất bại"
          );
        },
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Tạo chính sách chiết khấu mới"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      width={700}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={createMutation.isPending}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          customMultiplier: 1.05,
        }}
      >
        <Card className="mb-4" size="small" title="Chọn Dealers">
          <Form.Item
            name="dealerIds"
            label="Danh sách Dealers"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 dealer!" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn dealers"
              loading={loadingDealers}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={dealers.map((dealer: IDealer) => ({
                label: `${dealer.id}`,
                value: dealer.id,
              }))}
            />
          </Form.Item>
        </Card>

        <Card className="mb-4" size="small" title="Chọn Vehicle Models">
          <Form.Item
            name="vehicleModelIds"
            label="Danh sách Vehicle Models"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 vehicle!" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn vehicle models"
              loading={loadingVehicles}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={vehicles.map((vehicle: any) => ({
                label: `${vehicle.id}`,
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

          <Form.Item
            name="finalPrice"
            label="Giá cuối cùng (VND)"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
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
            <strong>tất cả các tổ hợp</strong> giữa dealers và vehicles đã chọn.
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDiscountPolicyModal;
