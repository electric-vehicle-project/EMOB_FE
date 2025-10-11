import { Button } from "antd";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export const ButtonPrimary: React.FC<Props> = ({ children, onClick }) => (
  <Button type="primary" className="!h-12 w-full" onClick={onClick}>
    {children}
  </Button>
);
