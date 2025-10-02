// DealerForm.tsx
import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import type { IDealer } from "../../model/Dealer";

interface Props {
  form: FormInstance<IDealer>;
  onFinish: (values: IDealer) => void;
  isEdit?: boolean;
}

export const DealerForm = ({ form, onFinish, isEdit }: Props) => (
  <Form
    layout="vertical"
    form={form}
    onFinish={onFinish}
    initialValues={{
      status: isEdit ? undefined : "Active",
    }}
  >
    {/* ✅ TÊN ĐẠI LÝ — realtime validation + 4 thông điệp */}
    <Form.Item
      name="name"
      label="Tên đại lý"
      validateTrigger={["onChange", "onBlur"]} // ← hiện lỗi ngay khi gõ
      rules={[
        { required: true, message: "Vui lòng nhập tên đại lý." }, // 1️⃣
        {
          validator: (_, value: string) => {
            if (value == null) return Promise.resolve();
            const v = value.trim();

            // 2️⃣ độ dài
            if (v.length > 0 && (v.length < 3 || v.length > 50)) {
              return Promise.reject("Tên đại lý phải từ 3 đến 50 ký tự.");
            }

            // 3️⃣ phải có ít nhất một chữ cái (hỗ trợ tiếng Việt)
            if (v && !/[A-Za-zÀ-ỹ]/.test(v)) {
              return Promise.reject(
                "Tên đại lý phải chứa ít nhất một chữ cái."
              );
            }

            // 4️⃣ chỉ cho phép chữ, số, khoảng trắng và -, &, .
            // Lưu ý: đặt dấu '-' ở cuối set để tránh hiểu là khoảng
            // Dấu - đặt ở cuối, không cần escape
            const allowed = /^[A-Za-zÀ-ỹ0-9\s&.-]+$/;

            if (v && !allowed.test(v)) {
              return Promise.reject(
                "Tên đại lý chỉ được chứa chữ, số, khoảng trắng và các ký tự -, &, ."
              );
            }

            return Promise.resolve();
          },
        },
      ]}
    >
      <Input placeholder="Nhập tên đại lý" allowClear />
    </Form.Item>

    {/* E-mail */}
    <Form.Item
      name="email"
      label="E-mail"
      rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
    >
      <Input placeholder="Nhập email" allowClear />
    </Form.Item>

    {/* ✅ SỐ ĐIỆN THOẠI — realtime validation gọn gàng */}
    <Form.Item
      name="phone"
      label="Số điện thoại"
      validateTrigger={["onChange", "onBlur"]}
      rules={[
        { required: true, message: "Vui lòng nhập số điện thoại" },
        {
          validator: (_, value: string) => {
            if (!value) return Promise.resolve();
            const v = value.replace(/\s+/g, ""); // bỏ khoảng trắng người dùng lỡ nhập

            // chỉ số và 10–11 chữ số, bắt đầu bằng 0
            if (!/^0\d{9,10}$/.test(v)) {
              return Promise.reject(
                "Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số (chỉ nhập số)."
              );
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Input placeholder="Ví dụ: 0912345678" inputMode="numeric" allowClear />
    </Form.Item>

    {/* Địa chỉ */}
    <Form.Item
      name="address"
      label="Địa chỉ"
      rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
    >
      <Input placeholder="Nhập địa chỉ" allowClear />
    </Form.Item>

    {/* Trạng thái */}
    <Form.Item
      name="status"
      label="Trạng thái"
      rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
    >
      <Select
        options={[
          { label: "Active", value: "Active" },
          { label: "Inactive", value: "Inactive" },
        ]}
      />
    </Form.Item>
  </Form>
);
