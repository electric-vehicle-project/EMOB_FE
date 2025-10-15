import { Modal } from "antd";
import { VehicleForm } from "../../molecules/VehicleForm";
import type { IVehicle } from "../../../model/Vehicle";
import { useEffect } from "react";
import { useForm } from "antd/es/form/Form";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IVehicle) => void;
  initialValues?: IVehicle;
  canEditPrices?: boolean;
}

export const VehicleModal = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  canEditPrices,
}: Props) => {
  const [form] = useForm<IVehicle>();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={initialValues ? "Chỉnh sửa thông tin xe" : "Thêm xe điện mới"}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Huỷ"
      onOk={() => form.submit()}
    >
      <VehicleForm
        form={form}
        onFinish={onSubmit}
        canEditPrices={canEditPrices}
      />
    </Modal>
  );
};
