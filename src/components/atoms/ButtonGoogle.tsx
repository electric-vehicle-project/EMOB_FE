import { Button, Modal } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useState } from "react";

export const ButtonGoogle = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsOpen(true);
  };

  const handleClosePopup = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Nút Google */}
      <Button
        onClick={handleOpenPopup}
        className="!h-full w-full !bg-white !text-[#627254] !flex !items-center !justify-center gap-2 hover:!bg-[#f5f5f5] transition-all duration-200"
        type="default"
      >
        <GoogleOutlined className="text-lg" />
        <p className="font-medium">Đăng nhập với Google</p>
      </Button>

      {/* Popup hiển thị khi nhấn */}
      <Modal
        open={isOpen}
        onCancel={handleClosePopup}
        footer={null}
        centered
        className="text-center"
      >
        <div className="flex flex-col items-center space-y-4 py-6">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="w-12 h-12"
          />
          <h2 className="text-lg font-semibold">Đăng nhập với Google</h2>
          <p className="text-sm text-gray-600">
            bla bla bla
          </p>
          <button
            onClick={handleClosePopup}
            style={{
              backgroundColor: "#627254",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Đóng
          </button>
        </div>
      </Modal>
    </>
  );
};
