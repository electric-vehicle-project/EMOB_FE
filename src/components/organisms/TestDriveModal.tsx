import { Modal, Form } from "antd";
import { TestDriveForm } from "../molecules/TestDriveForm";
import type { ITestDrive } from "../../model/TestDrive";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ITestDrive) => void;
  initialValues?: ITestDrive;
}

export const TestDriveModal = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}: Props) => {
  const [form] = Form.useForm<ITestDrive>();

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
      title={initialValues ? "Sửa lịch lái thử" : "Thêm lịch lái thử"}
      onCancel={onClose}
      okText="Lưu"
      onOk={() => form.submit()}
    >
      <TestDriveForm form={form} onFinish={onSubmit} />
    </Modal>
  );
};
