import { Form, Input } from "antd";
import type { FormInstance } from "antd/es/form";
import { useEffect } from "react";
import type { IDealer } from "../../../model/Dealer";
import type { DealerFormValues } from "./dealerUtils";
import {
  emailRegex,
  normalizeDealerValues,
  isSameDealerValues,
  stripPhone,
  toLocalPhone,
  trimEdges,
} from "./dealerUtils";

const vnMobile = /^(0|\+84)(1|2|3|4|5|6|7|8|9)\d{8}$/;

interface Props {
  open: boolean;
  form: FormInstance<DealerFormValues>;
  isEdit?: boolean;
  currentId?: string;
  existingDealers: IDealer[];
  onFinish: (values: DealerFormValues) => void;
  onCanSubmitChange?: (can: boolean) => void;
  baseline: DealerFormValues | null;
}

export const DealerForm: React.FC<Props> = ({
  open,
  form,
  isEdit,
  currentId,
  existingDealers,
  onFinish,
  onCanSubmitChange,
  baseline,
}) => {
  // ==== Helpers check trùng (bỏ qua currentId khi Edit) ====
  const isNameDup = (nameNorm: string) =>
    existingDealers.some(
      (d) => (d.name ?? "").trim() === nameNorm && d.id !== currentId
    );

  const isContactDup = (contactNorm: string) =>
    existingDealers.some((d) => {
      const norm = normalizeDealerValues({
        contactInfo: d.contactInfo,
      }).contactInfo;
      return norm === contactNorm && d.id !== currentId;
    });

  // Tính lại trạng thái nút theo lỗi & dirty.
  const recomputeSubmitState = (allFields?: { errors: string[] }[]) => {
    const hasErrors = (allFields ?? form.getFieldsError()).some(
      (f) => f.errors.length > 0
    );
    const current = normalizeDealerValues(form.getFieldsValue());
    const dirty = isEdit
      ? baseline
        ? !isSameDealerValues(current, baseline)
        : true
      : form.isFieldsTouched(true);
    onCanSubmitChange?.(!hasErrors && dirty);
  };

  // ✅ Khi mở modal: KHÔNG gọi validateFields -> không đỏ sẵn.
  useEffect(() => {
    if (!open) return;
    // chờ 1 tick để form mount xong rồi tính trạng thái nút
    const id = setTimeout(() => recomputeSubmitState(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, baseline, existingDealers, currentId]);

  return (
    <Form<DealerFormValues>
      layout="vertical"
      form={form}
      autoComplete="off"
      requiredMark="optional"
      className="space-y-2"
      // ✅ Chỉ hiện lỗi sau khi người dùng tương tác; debounce cho mượt
      validateTrigger={["onChange", "onBlur"]}
      // ✅ đọc allFields để lấy errors mới nhất (không trễ 1 nhịp)
      onFieldsChange={(_, allFields) =>
        recomputeSubmitState(allFields as { errors: string[] }[])
      }
      onFinish={(values) => onFinish(normalizeDealerValues(values))}
    >
      <Form.Item
        name="name"
        label="Tên đại lý"
        rules={[
          { required: true, message: "Vui lòng nhập tên đại lý" },
          { min: 3, message: "Tên đại lý phải có ít nhất 3 ký tự" },
          { max: 120, message: "Tên đại lý quá dài (tối đa 120 ký tự)" },
          {
            pattern: /^[\p{L}\d\s'.-]+$/u,
            message: "Chỉ chữ, số và ký tự cơ bản",
          },
          {
            validator: (_, v?: string) => {
              const nameNorm = trimEdges(v || "");
              if (!nameNorm) return Promise.resolve();
              if (isNameDup(nameNorm)) {
                return Promise.reject(
                  new Error("Tên đại lý đã tồn tại trong hệ thống")
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="VD: Nguyen A Auto – Quận 7" allowClear />
      </Form.Item>

      <Form.Item
        name="contactInfo"
        label="Thông tin liên hệ"
        extra="Có thể nhập email hoặc số điện thoại"
        rules={[
          { required: true, message: "Vui lòng nhập thông tin liên hệ" },
          { max: 100, message: "Thông tin liên hệ quá dài (tối đa 100 ký tự)" },
          {
            validator: (_, v?: string) => {
              const val = trimEdges(v || "");
              if (!val) return Promise.resolve();
              if (emailRegex.test(val.toLowerCase())) return Promise.resolve();
              const raw = stripPhone(val);
              if (!vnMobile.test(raw)) {
                return Promise.reject(
                  new Error("Email hợp lệ hoặc số VN (090..., +84...)")
                );
              }
              return Promise.resolve();
            },
          },
          {
            validator: (_, v?: string) => {
              const val = trimEdges(v || "");
              if (!val) return Promise.resolve();
              const normalized = emailRegex.test(val.toLowerCase())
                ? val.toLowerCase()
                : toLocalPhone(val);
              if (isContactDup(normalized)) {
                return Promise.reject(
                  new Error("Email/SĐT đã tồn tại trong hệ thống")
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="VD: daily@emob.vn hoặc 0901234567" allowClear />
      </Form.Item>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Form.Item
          name="country"
          label="Quốc gia"
          rules={[
            { required: true, message: "Vui lòng nhập quốc gia" },
            { min: 2, message: "Tên quốc gia quá ngắn" },
            { max: 60, message: "Tên quốc gia quá dài (≤60)" },
            {
              pattern: /^[\p{L}\s'.-]+$/u,
              message: "Chỉ nhập chữ và khoảng trắng",
            },
          ]}
        >
          <Input placeholder="VD: Việt Nam" allowClear />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ" },
            { min: 8, message: "Địa chỉ quá ngắn" },
            { max: 255, message: "Địa chỉ quá dài (≤255)" },
            {
              pattern: /^[\p{L}\d\s,.'-]+$/u,
              message: "Chỉ chữ, số, dấu phẩy, chấm, gạch nối",
            },
          ]}
        >
          <Input placeholder="VD: 123 Nguyễn Trãi, Quận 5, TP.HCM" allowClear />
        </Form.Item>
      </div>
    </Form>
  );
};
