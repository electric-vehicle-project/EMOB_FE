// import { Button, Modal } from "antd";
// import { GoogleOutlined } from "@ant-design/icons";
// import { useState } from "react";

// export const ButtonGoogle = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleOpenPopup = () => {
//     setIsOpen(true);
//   };

//   const handleClosePopup = () => {
//     setIsOpen(false);
//   };

//   return (
//     <>
//       {/* Nút Google */}
//       <Button
//         onClick={handleOpenPopup}
//         className="!h-12 w-full !bg-white !text-[#627254] hover:!bg-[var(--default-color)]  hover:!text-white"
//         type="default"
//       >
//         <GoogleOutlined className="text-lg" />

//         <p className="font-medium">Đăng nhập với Google</p>
//       </Button>

//       {/* Popup hiển thị khi nhấn */}
//       <Modal
//         open={isOpen}
//         onCancel={handleClosePopup}
//         footer={null}
//         centered
//         className="text-center"
//       >
//         <div className="flex flex-col items-center space-y-4 py-6">
//           <img
//             src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
//             alt="Google Logo"
//             className="w-12 h-12"
//           />
//           <h2 className="text-lg font-semibold">Đăng nhập với Google</h2>
//           <p className="text-sm text-gray-600">bla bla bla</p>
//           <button
//             onClick={handleClosePopup}
//             style={{
//               backgroundColor: "#627254",
//               color: "white",
//               border: "none",
//               borderRadius: "6px",
//               padding: "8px 16px",
//               cursor: "pointer",
//               fontWeight: 500,
//             }}
//           >
//             Đóng
//           </button>
//         </div>
//       </Modal>
//     </>
//   );
// };


import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "../../hook/useGoogleLogin";

export const ButtonGoogle = () => {
  const { startGoogleLogin, loading } = useGoogleLogin();

  return (
    <Button
      onClick={startGoogleLogin}
      loading={loading}
      className="!h-12 w-full !bg-white !text-[#627254] hover:!bg-[var(--default-color)] hover:!text-white"
      type="default"
    >
      <GoogleOutlined className="text-lg" />
      <p className="font-medium ml-2">Đăng nhập với Google</p>
    </Button>
  );
};
