import { Modal, Form, Select, InputNumber, Button } from "antd";
import { toast } from "react-toastify";
import type {
  MembershipLevel,
  IDealerPointRule,
  DealerPointRuleRequest,
} from "../../../model/DealerPointRule";

interface Props {
  open: boolean;
  onClose: () => void;
  existingRules: IDealerPointRule[];
  dealerId: string;
  onSuccess: (payload: DealerPointRuleRequest) => void;
}

const LEVELS: MembershipLevel[] = [
  "NORMAL",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
];

export const CreateDealerPointRuleModal = ({
  open,
  onClose,
  existingRules,
  dealerId,
  onSuccess,
}: Props) => {
  const [form] = Form.useForm<DealerPointRuleRequest>();

  const used = new Set(existingRules.map((r) => r.membershipLevel));
  const creatableLevels = LEVELS.filter((l) => !used.has(l));

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const payload: DealerPointRuleRequest = {
        level: values.level,
        dealerId,
        minPoints: Number(values.minPoints),
        price: Number(values.price),
      };

      onSuccess(payload);
      toast.success("Đã thêm quy tắc. Nhấn 'Lưu thay đổi' để xác nhận!");

      form.resetFields();
      onClose();
    } catch {
      /* empty */
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={440}>
      <h2 className="text-lg font-semibold mb-4 text-[#627254]">
        Tạo quy tắc tích điểm
      </h2>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Cấp độ"
          name="level"
          rules={[{ required: true, message: "Chọn cấp độ!" }]}
        >
          <Select placeholder="Chọn cấp độ">
            {creatableLevels.map((l) => (
              <Select.Option key={l} value={l}>
                {l}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Điểm tối thiểu"
          name="minPoints"
          rules={[
            { required: true, message: "Nhập điểm tối thiểu!" },
            {
              validator: (_, v) =>
                Number(v) < 0
                  ? Promise.reject("Điểm phải ≥ 0")
                  : Promise.resolve(),
            },
          ]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Giá trị quy đổi (₫)"
          name="price"
          rules={[
            { required: true, message: "Nhập giá!" },
            {
              validator: (_, v) =>
                Number(v) < 0
                  ? Promise.reject("Giá phải ≥ 0")
                  : Promise.resolve(),
            },
          ]}
        >
          <InputNumber min={0} step={100} style={{ width: "100%" }} />
        </Form.Item>
      </Form>

      <div className="flex justify-end gap-3 mt-5">
        <Button
          type="default"
          onClick={onClose}
          className="border-[#627254] text-[#627254]"
        >
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={handleCreate}
          className="!bg-[#627254] hover:!bg-[#4f6f52] !text-white border-none"
        >
          Thêm
        </Button>
      </div>
    </Modal>
  );
};
