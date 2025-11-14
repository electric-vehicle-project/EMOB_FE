import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import type { IDealer } from "../../../model/Dealer";
import type { DealerFormValues, Region } from "./dealerUtils";
import { normalizeDealerValues } from "./dealerUtils";

interface Props {
  open: boolean;
  form: FormInstance<DealerFormValues>;
  isEdit?: boolean;
  currentId?: string;
  existingDealers: IDealer[];
  onFinish: (values: DealerFormValues) => void;
  onCanSubmitChange?: (can: boolean) => void; // giữ để không lỗi chỗ khác, không dùng
  baseline: DealerFormValues | null;
}

const REGION_OPTIONS: { label: string; value: Region }[] = [
  { label: "Miền Bắc", value: "NORTH" },
  { label: "Miền Trung", value: "CENTRAL" },
  { label: "Miền Nam", value: "SOUTH" },
];

export const DealerForm: React.FC<Props> = ({
  form,
  isEdit,
  currentId,
  existingDealers,
  onFinish,
}) => {
  return (
    <Form<DealerFormValues>
      layout="vertical"
      form={form}
      autoComplete="off"
      requiredMark="optional"
      className="space-y-2"
      validateTrigger="onSubmit" // ✅ chỉ validate khi submit
      onFinish={(values) => onFinish(normalizeDealerValues(values))}
    >
      <Form.Item
        name="name"
        label="Tên đại lý"
        rules={[
          { required: true, message: "Vui lòng nhập tên đại lý" },
          { min: 3, message: "Tên đại lý phải có ít nhất 3 ký tự" },
          { max: 120, message: "Tên đại lý quá dài (tối đa 120 ký tự)" },
        ]}
      >
        <Input placeholder="VD: VinFast Hà Nội" allowClear />
      </Form.Item>

      <Form.Item
        name="emailContact"
        label="Email liên hệ"
        rules={[
          { type: "email", message: "Email không hợp lệ" },
          { required: true, message: "Vui lòng nhập email liên hệ" },
          {
            // ✅ rule kiểm tra trùng email
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const normalized = String(value).trim().toLowerCase();

              const duplicated = existingDealers.some((d) => {
                const dealerEmail = (d.emailContact || "").trim().toLowerCase();
                if (!dealerEmail) return false;
                // khi edit thì bỏ qua chính bản thân nó
                if (isEdit && currentId && d.id === currentId) return false;
                return dealerEmail === normalized;
              });

              if (duplicated) {
                return Promise.reject(
                  new Error("Email này đã tồn tại trong hệ thống")
                );
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="VD: vinfast@company.com" allowClear />
      </Form.Item>

      <Form.Item
        name="phoneContact"
        label="Số điện thoại liên hệ"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            pattern: /^(0|\+84)(1|2|3|4|5|6|7|8|9)\d{8}$/,
            message: "Số điện thoại không hợp lệ",
          },
        ]}
      >
        <Input placeholder="VD: 0901234567" allowClear />
      </Form.Item>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Form.Item
          name="country"
          label="Quốc gia"
          rules={[{ required: true, message: "Vui lòng nhập quốc gia" }]}
        >
          <Input placeholder="VD: Việt Nam" allowClear />
        </Form.Item>

        <Form.Item
          name="region"
          label="Khu vực"
          rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
        >
          <Select
            options={REGION_OPTIONS}
            placeholder="Chọn khu vực"
            showSearch={false}
            allowClear
          />
        </Form.Item>
      </div>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[
          { required: true, message: "Vui lòng nhập địa chỉ" },
          { min: 8, message: "Địa chỉ quá ngắn" },
        ]}
      >
        <Input placeholder="VD: 6 Hồng Đức, Bình Thọ, TP.Thủ Đức" allowClear />
      </Form.Item>
    </Form>
  );
};
