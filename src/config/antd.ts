import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    fontFamily: "Inter, sans-serif"
  },
  components: {
    Button: {
      // Màu Default (Mặc định)
      defaultBg: "#24282B", // nền
      defaultColor: "#D9D9D9", // chữ
      defaultBorderColor: "#24282B", // viền

      defaultHoverBg: "#2E3338", // nền hover
      defaultHoverColor: "#D9D9D9", // chữ hover
      defaultHoverBorderColor: "#2E3338", // viền hover

      defaultActiveBg: "#2E3338", // nền khi giữ chuột
      defaultActiveColor: "#D9D9D9", // chữ khi giữ chuột
      defaultActiveBorderColor: "#2E3338", // viền khi giữ chuột

      controlOutline: "none",

      // Màu Primary
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
      colorPrimaryActive: "#414d38",
      colorPrimaryBg: "#627254",
    },
    Checkbox: {
      colorPrimary: "#627254",
    },
  },
};
