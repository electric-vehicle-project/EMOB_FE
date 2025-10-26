import { Modal } from "antd";
import { useEffect } from "react";
import { useForm } from "antd/es/form/Form";
import { DealerForm } from "../molecules/DealerForm";
import type { IDealer } from "../../model/Dealer";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IDealer) => void;
  initialValues?: IDealer;
}

export const DealerModal = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}: Props) => {
  const [form] = useForm<IDealer>();

  useEffect(() => {
    if (open) {
      if (initialValues) form.setFieldsValue(initialValues);
      else form.resetFields();
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={initialValues ? "Sửa thông tin đại lý" : "Thêm đại lý mới"}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
      onOk={() => form.submit()}
    >
      <DealerForm form={form} onFinish={onSubmit} isEdit={!!initialValues} />
    </Modal>
  );
};
