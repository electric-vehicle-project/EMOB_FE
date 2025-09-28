import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    fontFamily: "Inter, sans-serif"
  },
  components: {
    Button: {
      // Primary
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
      colorPrimaryActive: "#414d38",
      colorPrimaryBg: "#627254",
      controlTmpOutline: "rgba(98, 114, 84, 1)",

      // Default
      colorBgSolid: "#24282B",
      defaultHoverBg: "#262626",
      defaultHoverColor: "#D9D9D9",
    },
    Checkbox: {
      colorPrimary: "#627254",
    },
  },
};
