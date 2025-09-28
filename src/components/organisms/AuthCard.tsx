import { LoginForm } from "../molecules/LoginForm";
import { Typography } from "../atoms/Typography";

export const AuthCard = () => (
  <div className="bg-[#DDDDDD] rounded-xl p-10 w-full max-w-full items-top">
    <Typography>
      Welcome back to
    </Typography>
    <h1 className="text-6xl tracking-[.20em] font-[jsMath-cmbx10] items-left text-[#627254] mb-8">EMOB!</h1>
    <LoginForm />
  </div>
);
