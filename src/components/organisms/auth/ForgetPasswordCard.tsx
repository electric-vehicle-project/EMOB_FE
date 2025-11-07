import { ForgetPasswordForm } from "../../molecules/auth/ForgetPasswordForm";

export const ForgetPasswordCard = () => (
  <div className="bg-[#DDDDDD]">
    <h2 className="!pb-2 font-bold text-4xl  tracking-[.20em] font-[Rhodium_Libre]">
      Welcome back to
    </h2>
    <h1 className="font-bold text-7xl tracking-[.20em] font-[jsMath-cmbx10] items-left text-[#627254]">
      EMOB!
    </h1>
    <h2 className="text-[#627254] !pt-10 !pb-5 text-center">
      Nhập Email của bạn để nhận mã xác thực OTP:
    </h2>
    <ForgetPasswordForm />
  </div>
);
