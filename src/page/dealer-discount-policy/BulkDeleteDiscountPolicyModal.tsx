import { Modal, Form, message } from "antd";
import SelectInput from "../../components/atoms/SelectInput";
import {
  useBulkDeleteDiscountPolicies,
  useGetAllDealers,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";
import type { IDealer } from "../../model/Dealer";
import type { IVehicle } from "../../model/Vehicle";
import { toast } from "react-toastify";

const BulkDeleteDiscountPolicyModal = ({ open, onClose, onSuccess }: any) => {
  const [form] = Form.useForm();
  const { mutateAsync: bulkDelete, isPending } =
    useBulkDeleteDiscountPolicies();

  const { data: dealersData } = useGetAllDealers(0, 1000);
  const { data: vehiclesData } = useGetVehicles(0, 1000);

  const dealerOptions =
    dealersData?.result?.data?.map((d: IDealer) => ({
      label: d.name,
      value: d.id,
    })) || [];

  const vehicleOptions =
    vehiclesData?.result?.data?.map((v: IVehicle) => ({
      label: v.model,
      value: v.id,
    })) || [];

  const handleSubmit = async (values: any) => {
    const payload = {
      dealerIds: values.dealerIds,
      vehicleModelIds: values.vehicleModelIds,
    };

    try {
      await bulkDelete(payload);
      toast.success("Đã xóa chính sách hàng loạt!");
      onSuccess?.();
      onClose();
      form.resetFields();
    } catch (err: any) {
      toast.error("Xóa hàng loạt thất bại!");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Xóa hàng loạt"
      cancelText="Hủy"
      confirmLoading={isPending}
      centered
      destroyOnClose
      width={600}
      okButtonProps={{ danger: true }}
      title="🗑 Xóa hàng loạt chính sách chiết khấu"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <SelectInput
          label="Chọn đại lý (Dealers)"
          name="dealerIds"
          placeholder="Chọn đại lý cần xóa"
          options={dealerOptions}
          mode="multiple"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất 1 đại lý" },
          ]}
        />

        <SelectInput
          label="Chọn xe (Vehicles)"
          name="vehicleModelIds"
          placeholder="Chọn xe cần xóa"
          options={vehicleOptions}
          mode="multiple"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 xe" }]}
        />
      </Form>
    </Modal>
  );
};

export default BulkDeleteDiscountPolicyModal;
