import React, { useEffect } from "react";
import { Modal, Form, Button, InputNumber, Select, Switch } from "antd";
import { useApproveQuotation } from "../../service/quotationService";
import { toast } from "react-toastify";

interface ApproveQuotationModalProps {
  open: boolean;
  onClose: () => void;
  quotationId: string;
  items: any[];
  onSuccess?: () => void;
}

const ApproveQuotationModal: React.FC<ApproveQuotationModalProps> = ({
  open,
  onClose,
  quotationId,
  items,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { mutateAsync: approveQuotation, isPending } = useApproveQuotation();

  useEffect(() => {
    if (items?.length) {
      form.setFieldsValue({
        items: items.map((item: any) => ({
          itemsId: item.id,
          promotionId: item.promotionId || null,
          quantity: item.quantity || 1,
          approved: true,
        })),
      });
    }
  }, [items, form]);

  const handleSubmit = async (values: any) => {
    const approvedItems = values.items.filter((i: any) => i.approved);

    if (approvedItems.length === 0) {
      toast.warning("Chưa chọn item nào để duyệt!");
      return;
    }

    const payload = approvedItems.map((item: any) => ({
      itemsId: item.itemsId,
      promotionId: item.promotionId || null,
      quantity: item.quantity || 1,
    }));

    try {
      await approveQuotation({ id: quotationId, data: payload });
      toast.success("Duyệt báo giá thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Không thể duyệt báo giá. Vui lòng thử lại."
      );
    }
  };

  return (
    <Modal
      open={open}
      title="Xác nhận duyệt báo giá"
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={700}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.List name="items">
          {(fields) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="grid grid-cols-4 gap-4 p-3 border rounded-md mb-3 bg-gray-50" // ⚙️ Đổi từ 3 → 4 cột
                >
                  {/* Cột bật/tắt duyệt */}
                  <Form.Item
                    {...restField}
                    name={[name, "approved"]}
                    label="Duyệt"
                    valuePropName="checked"
                    className="flex items-center"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "itemsId"]}
                    label="Item ID"
                  >
                    <InputNumber style={{ width: "100%" }} disabled />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "promotionId"]}
                    label="Khuyến mãi ID"
                  >
                    <Select
                      placeholder="Chọn khuyến mãi (nếu có)"
                      allowClear
                      options={[
                        { label: "Không áp dụng", value: null },
                        ...(items || [])
                          .filter((i) => i.promotionId)
                          .map((i) => ({
                            label: i.promotionName || i.promotionId,
                            value: i.promotionId,
                          })),
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    label="Số lượng"
                    rules={[{ required: true, message: "Nhập số lượng" }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </div>
              ))}
            </>
          )}
        </Form.List>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Duyệt báo giá
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ApproveQuotationModal;
