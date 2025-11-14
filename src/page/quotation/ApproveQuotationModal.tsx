import React, { useEffect, useMemo } from "react";
import { Modal, Form, Button, InputNumber, Select, Switch, Input } from "antd";
import {
  useApproveQuotation,
  useGetQuotationById,
} from "../../service/quotationService";
import { toast } from "react-toastify";
import { useGetVehicleById } from "../../service/vehicleService";

interface ApproveQuotationModalProps {
  open: boolean;
  onClose: () => void;
  quotationId: string;
  items: any[]; // fallback nếu cần
  onSuccess?: () => void;
}

/* ---------- TÊN XE ---------- */

// component convert VehicleId thành vehicleName
const VehicleModelName: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
  const { data, isLoading } = useGetVehicleById(vehicleId);
  if (isLoading) return <span>...</span>;
  return <span>{data?.result?.model || "-"}</span>;
};

/* ---------- MODAL ---------- */

const ApproveQuotationModal: React.FC<ApproveQuotationModalProps> = ({
  open,
  onClose,
  quotationId,
  items,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { mutateAsync: approveQuotation, isPending } = useApproveQuotation();

  // Nếu hook của bạn nhận param khác, ví dụ: useGetQuotationById({ id: quotationId })
  // thì sửa lại dòng dưới cho đúng:
  const { data: quotationDetail } = useGetQuotationById(quotationId);

  // Ưu tiên dùng items từ API chi tiết, fallback sang props.items nếu cần
  const detailItems = useMemo(
    () => quotationDetail?.result?.items || items || [],
    [quotationDetail, items]
  );

  useEffect(() => {
    if (detailItems?.length) {
      form.setFieldsValue({
        items: detailItems.map((item: any) => ({
          itemsId: item.id,
          promotionId: item.promotionId ?? "",
          quantity: item.quantity ?? 1,
          approved: true,
        })),
      });
    } else {
      form.resetFields(["items"]);
    }
  }, [detailItems, form]);

  const handleSubmit = async (values: any) => {
    const approvedItems = (values.items || []).filter((i: any) => i.approved);

    if (approvedItems.length === 0) {
      toast.warning("Chưa chọn item nào để duyệt!");
      return;
    }

    const normalizePromotionId = (id: string | null | undefined) =>
      !id ? null : id;

    const payload = approvedItems.map((item: any) => ({
      itemsId: item.itemsId,
      promotionId: normalizePromotionId(item.promotionId),
      quantity: item.quantity ?? 1,
    }));

    console.log("DEBUG approve payload =", payload);

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

  const promotionOptions = [
    { label: "Không áp dụng", value: "" },
    ...(detailItems || [])
      .filter((i: any) => i.promotionId)
      .map((i: any) => ({
        label: i.promotionName || i.promotionId,
        value: i.promotionId,
      })),
  ];

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
              {fields.map(({ key, name, ...restField }) => {
                // vehicleId lấy từ detailItems
                const originalItem = detailItems[name];
                const vehicleId = originalItem?.vehicleId;

                const rowValues = form.getFieldValue(["items", name]) || {};
                const itemsId = rowValues.itemsId;

                return (
                  <div
                    key={key}
                    className="border rounded-md mb-3 bg-gray-50 p-4"
                  >
                    {/* HÀNG 1: Duyệt - Mã báo giá - Tên xe - Khuyến mãi */}
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <Form.Item
                        {...restField}
                        name={[name, "approved"]}
                        label="Duyệt"
                        valuePropName="checked"
                        className="col-span-2 flex items-center"
                        style={{ marginBottom: 0 }}
                      >
                        <Switch />
                      </Form.Item>

                      <div className="col-span-3">
                        <Form.Item label="Tên xe" style={{ marginBottom: 0 }}>
                          {vehicleId ? (
                            <VehicleModelName vehicleId={vehicleId} />
                          ) : (
                            "-"
                          )}
                        </Form.Item>
                      </div>

                      <div className="col-span-3">
                        <Form.Item
                          {...restField}
                          name={[name, "promotionId"]}
                          label="Khuyến mãi"
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Chọn khuyến mãi"
                            allowClear
                            options={promotionOptions}
                          />
                        </Form.Item>
                      </div>
                      {/* HÀNG 2: Số lượng */}
                      <div className="col-span-3">
                        <Form.Item
                          {...restField}
                          name={[name, "quantity"]}
                          label="Số lượng"
                          rules={[{ required: true, message: "Nhập số lượng" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                );
              })}
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
