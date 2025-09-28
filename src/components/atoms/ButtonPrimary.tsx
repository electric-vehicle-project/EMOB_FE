import { Button } from "antd";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export const ButtonPrimary: React.FC<Props> = ({ children, onClick }) => (
  <Button type="primary" block size="large" onClick={onClick}>
    {children}
  </Button>
);
