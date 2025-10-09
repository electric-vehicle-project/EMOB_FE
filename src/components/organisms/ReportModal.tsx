import { Modal, Form } from "antd";
import type { IReport } from "../../model/report";
import { ReportForm } from "../molecules/ReportForm";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IReport) => void;
  initialValues?: IReport;
}

export const ReportModal = ({ open, onClose, onSubmit, initialValues }: Props) => {
  const [form] = Form.useForm<IReport>();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        // Mặc định: status Pending
        form.setFieldsValue({ status: "Pending" } as Partial<IReport>);
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={initialValues ? "Sửa phản hồi" : "Thêm phản hồi"}
      onCancel={onClose}
      okText="Lưu"
      onOk={() => form.submit()}
    >
      <ReportForm form={form} onFinish={onSubmit} />
    </Modal>
  );
};
