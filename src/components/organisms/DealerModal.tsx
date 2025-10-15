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

  // ✅ Reset hoặc set giá trị khi mở modal
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          contactInfo: initialValues.contactInfo,
          country: initialValues.country,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  // ✅ Submit form
  const handleSubmit = (values: IDealer) => {
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={initialValues ? "Sửa thông tin đại lý" : "Thêm đại lý mới"}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
      onOk={() => form.submit()}
      destroyOnClose
      maskClosable={false}
    >
      <DealerForm
        form={form}
        onFinish={handleSubmit}
        isEdit={!!initialValues}
      />
    </Modal>
  );
};
