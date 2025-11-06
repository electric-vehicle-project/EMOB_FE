import React, { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import type { IAccount, Gender } from "../../../model/Account";
import { useUpdateAccountProfile } from "../../../service/accountService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profile: IAccount;
}

const genderOptions = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
  { label: "Không xác định", value: "UNKNOWN" },
];

const EditProfileModal: React.FC<Props> = ({ open, onClose, onSuccess, profile }) => {
  const [form] = Form.useForm();
  const updateProfile = useUpdateAccountProfile();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      fullName: profile.fullName,
      phone: profile.phone,
      gender: profile.gender,
      address: profile.address,
      dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,
    });
  }, [open, form, profile]);

  const onFinish = async (values: {
    fullName: string;
    phone: string;
    gender: Gender;
    address: string;
    dateOfBirth?: dayjs.Dayjs;
  }) => {
    await updateProfile.mutateAsync({
      fullName: values.fullName?.trim(),
      phone: values.phone?.trim(),
      gender: values.gender,
      address: values.address?.trim(),
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "",
    });
    message.success("Cập nhật thông tin thành công");
    onSuccess();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} destroyOnClose centered title="Chỉnh sửa thông tin">
      <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false} className="mt-2">
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Nhập họ và tên" allowClear />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="Nhập số điện thoại" allowClear />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select options={genderOptions} placeholder="Chọn giới tính" />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>
        </div>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input.TextArea placeholder="Nhập địa chỉ" rows={3} allowClear />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50" onClick={onClose} type="button">
            Hủy
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#627254] hover:bg-[#525e46] text-white" onClick={() => form.submit()}>
            Lưu thay đổi
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
