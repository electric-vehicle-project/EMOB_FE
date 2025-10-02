import { Modal } from "antd";
import { DealerForm } from "../molecules/DealerForm";
import type { IDealer } from "../../model/Dealer";
import { useEffect } from "react";
import { useForm } from "antd/es/form/Form";

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

  // Reset hoặc set giá trị khi open modal
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues); // Sửa Dealer
      } else {
        form.resetFields(); // Thêm Dealer
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={initialValues ? "Sửa thông tin đại lý" : "Thêm đại lý mới"}
      onCancel={onClose}
      okText="Lưu"
      onOk={() => form.submit()}
    >
      <DealerForm form={form} onFinish={onSubmit} isEdit={!!initialValues} />
    </Modal>
  );
};
