import React from "react";
import { Button } from "antd";

const HomePage: React.FC = () => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg_Green.png')" }}
    >
      {/* Logo */}
      <img
        src="/logo.png"
        alt="EMOB Logo"
        className="absolute top-8 left-11 w-[95px] h-[95px] rounded-full z-20"
      />

      {/* Button */}
      <Button
        type="default"
        className="!absolute !top-12 !right-12 !px-8 !py-4 !text-lg !font-bold !rounded-xl !h-auto !w-auto z-20"
      >
        ĐĂNG NHẬP
      </Button>

      {/* chữ EMOB */}
      <h1
        className="absolute inset-0 flex items-center justify-center 
           font-teko font-bold leading-none select-none 
           z-10 scale-y-100"
        style={{
          fontFamily: "'Teko', sans-serif",
          fontWeight: "530",
          fontSize: "36vw", //  scale theo chiều ngang màn hình
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 40%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
      >
        EMOB
      </h1>
    </div>
  );
};

export default HomePage;
