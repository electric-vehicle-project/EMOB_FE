import { ResetPasswordForm } from "../../molecules/auth/ResetPasswordForm";

export const ResetPasswordCard = () => (
  <div className="bg-[#DDDDDD]">
    <h2 className="!pb-2 font-bold text-4xl  tracking-[.20em] font-[Rhodium_Libre]">
      Welcome back to
    </h2>
    <h1 className="font-bold text-7xl tracking-[.20em] font-[jsMath-cmbx10] items-left text-[#627254]">
      EMOB!
    </h1>

    <div className="!pt-10"><ResetPasswordForm /></div>

  </div>
);
