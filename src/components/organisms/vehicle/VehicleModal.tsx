import { Modal } from "antd";
import { VehicleForm } from "../../molecules/EVM/VehicleForm";
import type { IVehicle } from "../../../model/Vehicle";
import { useEffect } from "react";
import { useForm } from "antd/es/form/Form";
import { CarOutlined } from "@ant-design/icons";

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
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={initialValues ? "Lưu thay đổi" : "Tạo mới"}
      cancelText="Huỷ"
      width={860}
      destroyOnClose
      maskClosable={false}
      centered
      title={
        <div className="flex items-center gap-2">
          <CarOutlined className="text-[#627254]" />
          <span>
            {initialValues ? "Chỉnh sửa thông tin xe" : "Thêm xe điện mới"}
          </span>
        </div>
      }
      styles={{
        body: { paddingTop: 12, paddingBottom: 8 },
        header: { borderBottom: "1px solid #f0f0f0" },
        footer: { borderTop: "1px solid #f0f0f0" },
      }}
      okButtonProps={{
        className:
          "!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] !rounded-md",
      }}
      cancelButtonProps={{ className: "!rounded-md" }}
    >
      <VehicleForm
        form={form}
        onFinish={onSubmit}
        canEditPrices={canEditPrices}
      />
    </Modal>
  );
};

export default VehicleModal;
