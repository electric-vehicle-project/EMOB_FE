import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const TableWrapper = ({ children }: Props) => {
  return (
    <div className="rounded-[22px] overflow-hidden bg-white border border-gray-100 shadow-sm">
      {children}
    </div>
  );
};
