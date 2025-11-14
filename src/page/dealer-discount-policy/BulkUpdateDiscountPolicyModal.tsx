import { Modal, Form, InputNumber, DatePicker } from "antd";
import {
  useBulkUpdateDiscountPolicies,
  useGetAllDealers,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";
import SelectInput from "../../components/atoms/SelectInput";
import type { IDealer } from "../../model/Dealer";
import { toast } from "react-toastify";

const { RangePicker } = DatePicker;

const BulkUpdateDiscountPolicyModal = ({ open, onClose, onSuccess }: any) => {
  const [form] = Form.useForm();
  const { mutateAsync: bulkUpdate, isPending } =
    useBulkUpdateDiscountPolicies();

  // Lấy danh sách dealer + vehicle để chọn
  const { data: dealersData } = useGetAllDealers(0, 1000);
  const { data: vehiclesData } = useGetVehicles(0, 1000);

  // Tạo option danh sách đại lý
  const dealerOptions =
    dealersData?.result?.data?.map((d: IDealer) => ({
      label: d.name,
      value: d.id,
    })) ?? [];

  // Tạo option danh sách xe
  const vehicleOptions =
    vehiclesData?.result?.data?.map((v: any) => ({
      label: v.model,
      value: v.id,
    })) ?? [];

  // Submit handler
  const handleSubmit = async (values: any) => {
    if (!values.dateRange || values.dateRange.length !== 2) {
      toast.warning("Vui lòng chọn đầy đủ thời gian hiệu lực!");
      return;
    }

    const payload = {
      dealerIds: values.dealerIds,
      vehicleModelIds: values.vehicleModelIds,
      customMultiplier: values.customMultiplier,
      finalPrice: values.finalPrice,
      effectiveDate: values.dateRange[0].format("YYYY-MM-DD"),
      expiredDate: values.dateRange[1].format("YYYY-MM-DD"),
    };

    try {
      await bulkUpdate(payload);
      toast.success("Cập nhật hàng loạt chính sách thành công!");
      onSuccess?.();
      form.resetFields();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể cập nhật hàng loạt!"
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={isPending}
      okText="Cập nhật"
      cancelText="Hủy"
      title="Cập nhật hàng loạt chính sách chiết khấu"
      width={700}
      destroyOnClose
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <SelectInput
          label="Chọn đại lý"
          name="dealerIds"
          placeholder="Chọn ít nhất một đại lý"
          options={dealerOptions}
          mode="multiple"
          rules={[{ required: true, message: "Vui lòng chọn đại lý!" }]}
        />

        <SelectInput
          label="Chọn mẫu xe"
          name="vehicleModelIds"
          placeholder="Chọn ít nhất một xe"
          options={vehicleOptions}
          mode="multiple"
          rules={[{ required: true, message: "Vui lòng chọn xe!" }]}
        />

        <Form.Item
          label="Hệ số chiết khấu"
          name="customMultiplier"
          rules={[
            { required: true, message: "Vui lòng nhập hệ số chiết khấu!" },
          ]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: "100%" }}
            placeholder="Nhập hệ số, ví dụ: 1.05"
          />
        </Form.Item>

        <Form.Item label="Giá cuối cùng (VND)" name="finalPrice">
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            placeholder="Nhập giá cuối cùng"
          />
        </Form.Item>

        <Form.Item
          label="Thời gian hiệu lực"
          name="dateRange"
          rules={[
            { required: true, message: "Vui lòng chọn thời gian hiệu lực!" },
          ]}
        >
          <RangePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BulkUpdateDiscountPolicyModal;
