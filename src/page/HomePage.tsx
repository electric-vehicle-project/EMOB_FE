import React from "react";
import { Button } from "antd";

const HomePage: React.FC = () => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/bg_Green.png')" }}
    >
      <div className="w-full px-10  py-6 flex justify-between  items-center">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="EMOB Logo"
          className="w-[5vw] aspect-square rounded-full z-20"
        />

        {/* Button */}
        <Button
          type="default"
          size="large"
          className="z-20"
          style={{
            width: "200px",
            height: "60px",
            fontSize: "18px",
            fontWeight: "700",
            borderRadius: "12px",
          }}
        >
          ĐĂNG NHẬP
        </Button>
      </div>
      {/* chữ EMOB */}
      <h1
        className="absolute inset-0 flex items-end justify-center 
           font-teko font-bold leading-none select-none 
           z-10"
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
