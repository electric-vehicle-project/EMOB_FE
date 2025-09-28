type Props = {
  children: React.ReactNode;
  variant?: "title" | "subtitle";
};

export const Typography: React.FC<Props> = ({ children, variant = "title" }) => {
  if (variant === "title")
    return <h2 className="text-4xl font-bold tracking-[.20em] font-[Rhodium_Libre] mb-4 mt-4">{children}</h2>;
  return <p className="text-gray-500 mb-2">{children}</p>;
};
