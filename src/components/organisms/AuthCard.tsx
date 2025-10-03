import { LoginForm } from "../molecules/LoginForm";

export const AuthCard = () => (
  <div className="bg-[#DDDDDD] rounded-xl w-full !p-10 md:justify-top md:w-4/6">
    <h2 className="!pb-5 font-bold text-16lg md:text-1.5xl lg:text-2xl xl:text-4xl  tracking-[.20em] font-[Rhodium_Libre]">
      Welcome back to
    </h2>
    <h1 className="font-bold text-2xl md:text-4xl lg:text-6xl xl:text-7xl tracking-[.20em] font-[jsMath-cmbx10] items-left text-[#627254]">
      EMOB!
    </h1>
    <div className="!pt-5"><LoginForm /></div>
    
  </div>
);
