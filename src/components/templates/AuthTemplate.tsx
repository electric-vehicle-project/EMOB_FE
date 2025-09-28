import { AuthCard } from "../organisms/AuthCard";

export const AuthTemplate = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden">
      {/* -------- Layer 1: Decorative Pictures -------- */}
      <img
        src="src\assets\images\Rectangle 481.png"
        alt="decor"
        className="absolute top-0 left-0 w-auto h-auto object-contain"
      />
      <img
        src="src\assets\images\Rectangle 480.png"
        alt="decor"
        className="absolute bottom-0 right-0 w-auto h-auto object-contain"
      />

      {/* -------- Layer 2: Main Container -------- */}
      <div className="relative flex w-6/7 h-[80vh] bg-[#627254] rounded-[20px] shadow-2xl overflow-hidden">
        
        {/* Branding Section (2/7) */}
        <div className="w-2/6 flex flex-col  justify-top text-white p-10">
          <h1 className="text-8xl font-bold tracking-[.20em] font-[Josefin_Slab] mb-4 mt-4 items-center">EMOB</h1>
          <p className="text-4xl  font-[Rhodium_Libre] mb-8 items-left">
            Build green
            <br />
            Go green
          </p>
        </div>

        {/* Login Form Section (5/7) */}
        <div className="w-4/6 bg-[#DDDDDD] rounded-[20px] flex items-top justify-end">
          <div className="w-full max-w-xl rounded-[20px] mr-15">
            <AuthCard />
          </div>
        </div>
        
        <img className="absolute bottom-0 left-5 w-150 h-1/2.6 object-contain" src="src\assets\images\E-BIKE main.png" alt="e-bike" />
        <img className="absolute bottom-50 left-55 w-1/2 h-1/2 object-contain" src="src\assets\images\leafs-2.png" alt="" />
        
      </div>
    </div>
  );
};
