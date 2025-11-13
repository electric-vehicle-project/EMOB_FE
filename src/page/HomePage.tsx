import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser } from "../utils/getCurrentUser";
import { toast } from "react-toastify";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/bg_Green.png')" }}
    >
      {/* overlay gradient chữ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70 z-0" />

      {/* header */}
      <header className="relative z-10 flex justify-between items-start px-10 !pt-7">
        <motion.img
          src="/logo.png"
          alt="EMOB Logo"
          className="w-[8vw] min-w-[60px] aspect-square rounded-full drop-shadow-lg"
          whileHover={{ scale: 1.05 }}
        />

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="large"
            className="!rounded-full font-semibold px-8 shadow-md text-[15px] tracking-wide !bg-white !text-black"
            onClick={() => {
              if (user) {
                navigate("/" + user.role.toLowerCase())
              }
              else navigate("/auth/login")
            }}
          >
            Đăng nhập
          </Button>
        </motion.div>
      </header>

      {/* body */}
      <main className="relative z-10 flex flex-col justify-center items-center  text-center text-white">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="flex justify-center font-bold leading-none select-none z-10 pt-10"
          style={{
            fontFamily: "'Teko', sans-serif",
            fontSize: "26vw",
            lineHeight: "40vh",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 40%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          EMOB
        </motion.h1>

        {/* branding */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl font-[Rhodium_Libre] font-medium leading-relaxed text-white/90 "
        >
          Build Green - Go Green
        </motion.p>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xl font-light max-w-xl leading-relaxed text-white/90 "
        >
          Nền tảng quản lý hãng - đại lý xe điện toàn diện
          <br />
          <span className="font-medium text-white">
            Hiện đại, trực quan và kết nối thông minh
          </span>
        </motion.p>

      </main>

      {/* footer */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-white/60 text-xs md:text-sm tracking-wide z-10">
        © {new Date().getFullYear()} EMOB - Electric Mobility Manufacturer/Dealer Management System | v1.0.0
      </footer>
    </div>
  );
};

export default HomePage;

