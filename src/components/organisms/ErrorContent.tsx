import { Typography } from "antd";
import { BackHomeLink } from "../molecules/BackHomeLink";

const { Title } = Typography;

export const ErrorContent = () => (
  <div className="flex flex-col items-center justify-center space-y-6">
    <Title
      level={1}
      style={{
        fontSize: "10rem",
        color: "#627254",
        textShadow: "0px 0px 25px rgba(0,0,0,0.1)",
      }}
    >
      404
    </Title>
    <BackHomeLink />
  </div>
);
