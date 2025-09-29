import { Link } from "react-router-dom";

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-base font-medium underline underline-offset-4 hover:text-green-700 transition"
    >
      {children}
    </Link>
  );
};
