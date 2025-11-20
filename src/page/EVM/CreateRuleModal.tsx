/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Form, InputNumber, Select, Input } from "antd";
import { motion } from "framer-motion";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";
import { Button } from "../../components/atoms/Button";

import type { VehicleStatus } from "../../model/VehiclePriceRule";
import { VEHICLE_STATUS_LABELS } from "../../model/VehiclePriceRule";

interface CreateRuleModalProps {
  open: boolean;
  onClose: () => void;
  usedStatuses: Set<VehicleStatus>;
  creatableStatuses: VehicleStatus[];
  onSubmit: (values: {
    vehicleStatus: VehicleStatus;
    multiplier: number;
    note?: string;
  }) => void;
}

export const CreateRuleModal: React.FC<CreateRuleModalProps> = ({
  open,
  onClose,
  usedStatuses,
  creatableStatuses,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const initialValuesRef = useRef<any | null>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      initialValuesRef.current = null;
      setConfirmDiscardOpen(false);

      setTimeout(() => {
        initialValuesRef.current = form.getFieldsValue(true);
      }, 0);
    }
  }, [open, form]);

  const isDirty = () => {
    if (!initialValuesRef.current) return false;
    return (
      JSON.stringify(form.getFieldsValue(true)) !==
      JSON.stringify(initialValuesRef.current)
    );
  };

  const requestClose = () => {
    if (!isDirty()) return closeImmediately();
    setConfirmDiscardOpen(true);
  };

  const closeImmediately = () => {
    form.resetFields();
    setConfirmDiscardOpen(false);
    onClose();
  };

  const confirmDiscard = () => {
    closeImmediately();
  };

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as {
        vehicleStatus: VehicleStatus;
        multiplier: number;
        note?: string;
      };
      onSubmit(values);
      closeImmediately();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.debug("CreateRuleModal submit aborted", err);
      }
      // Validation errors are handled by Ant Design form items.
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={requestClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] max-w-[95%]"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <h2 className="text-xl font-semibold mb-5 text-[#414d38]">
          Tạo quy tắc giá
        </h2>

        <Form form={form} layout="vertical" className="space-y-3">
          <Form.Item
            name="vehicleStatus"
            label="Trạng thái xe"
            rules={[{ required: true, message: "Chọn trạng thái xe!" }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              className="rounded-full"
              popupClassName="rounded-xl"
            >
              {(creatableStatuses ?? [])
                .filter(
                  (s) => !(usedStatuses ?? new Set<VehicleStatus>()).has(s)
                )
                .map((s) => (
                  <Select.Option key={s} value={s}>
                    {VEHICLE_STATUS_LABELS[s]}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="multiplier"
            label="Hệ số nhân giá"
            rules={[
              { required: true, message: "Nhập hệ số!" },
              {
                validator(_, v) {
                  return v === undefined || v < 0
                    ? Promise.reject("Hệ số ≥ 0")
                    : Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0}
              step={0.1}
              style={{ width: "100%" }}
              className="rounded-full"
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              className="rounded-xl"
            />
          </Form.Item>
        </Form>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="default"
            onClick={requestClose}
            className="rounded-full"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            className="rounded-full px-6"
          >
            Thêm
          </Button>
        </div>
      </motion.div>

      {/* DeleteConfirm */}
      <DeleteConfirm
        open={confirmDiscardOpen}
        onCancel={() => setConfirmDiscardOpen(false)}
        onConfirm={confirmDiscard}
        message="Các thay đổi chưa lưu sẽ bị xóa. Bạn có chắc muốn hủy?"
        okText="Hủy thay đổi"
        danger
      />
    </div>
  );
};

export default CreateRuleModal;
