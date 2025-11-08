  // src/components/organisms/profile/ChangePasswordModal.tsx
  import React, { useState } from "react";
  import { Modal, Form, Input, message, Progress } from "antd";
  import { AxiosError } from "axios";
  import { Button } from "../../atoms/Button";
  import { useChangePassword } from "../../../service/accountService";
  import { useCurrentUser } from "../../../utils/getCurrentUser";
  import api from "../../../config/api";

  interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }

  const passwordRules = [
    { required: true, message: "Vui lòng nhập mật khẩu mới" },
    { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      message: "Phải có chữ hoa, chữ thường và số",
    },
  ];

  function getStrength(pwd: string) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const percent = Math.min(100, (score / 5) * 100);
    const label = percent >= 80 ? "Mạnh" : percent >= 60 ? "Trung bình" : "Yếu";
    const status: "exception" | "active" | "success" =
      percent >= 80 ? "success" : percent >= 60 ? "active" : "exception";
    return { percent, label, status };
  }

  const ChangePasswordModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const changePassword = useChangePassword();
    const user = useCurrentUser();

    const [newPwd, setNewPwd] = useState("");
    const [capsLock, setCapsLock] = useState(false);
    const strength = getStrength(newPwd);

    const onFinish = async (values: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error("Xác nhận mật khẩu không khớp");
        return;
      }
      if (values.newPassword === values.currentPassword) {
        message.error("Mật khẩu mới không được trùng mật khẩu hiện tại");
        return;
      }

      try {
        // 1) Xác thực currentPassword
        await api.post("/auth/login", {
          email: user?.email,
          password: values.currentPassword,
        });

        // 2) Reset password
        await changePassword.mutateAsync({ newPassword: values.newPassword });

        message.success("Đổi mật khẩu thành công");
        onSuccess();
        form.resetFields();
        setNewPwd("");
      } catch (err) {
        const error = err as AxiosError<{ message?: string; code?: number }>;
        const msg =
          error?.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng thử lại";
        message.error(msg);
      }
    };

    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        centered
        title="Đổi mật khẩu"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          requiredMark={false}
          className="mt-2"
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu hiện tại"
              className="!rounded-xl"
              onKeyUp={(e) =>
                setCapsLock(
                  (e as unknown as KeyboardEvent).getModifierState?.(
                    "CapsLock"
                  ) || false
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={passwordRules}
          >
            <>
              <Input.Password
                placeholder="Nhập mật khẩu mới"
                className="!rounded-xl"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                onKeyUp={(e) =>
                  setCapsLock(
                    (e as unknown as KeyboardEvent).getModifierState?.(
                      "CapsLock"
                    ) || false
                  )
                }
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {capsLock ? "⚠️ CapsLock đang bật" : " "}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{strength.label}</span>
                  <Progress
                    percent={strength.percent}
                    size="small"
                    status={strength.status}
                    showInfo={false}
                    className="min-w-[100px]"
                  />
                </div>
              </div>
            </>
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Xác nhận mật khẩu không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              className="!rounded-xl"
            />
          </Form.Item>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-white pt-3 mt-4 border-t z-10 flex justify-end gap-2">
            <Button type="default" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="primary"
              loading={changePassword?.isPending}
              onClick={() => form.submit()}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    );
  };

  export default ChangePasswordModal;
