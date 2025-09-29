import type { ReactNode } from "react";
import { Logo } from "../atoms/Logo";

export const ErrorTemplate = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col h-screen bg-[#DDDDDD]">
    <div className="flex items-start p-4">
      <Logo />
    </div>
    <div className="flex flex-1 items-center justify-center">{children}</div>
  </div>
);
