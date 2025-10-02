import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    fontFamily: "Inter, sans-serif"
  },
  components: {
    Input: {
      borderRadius: 9999,
      colorBgContainer: "white",
    },

    Button: {
      // Primary
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
      colorPrimaryActive: "#414d38",
      colorPrimaryBg: "#627254",
      borderRadius: 9999,
      
      // Default
      colorBgSolid: "#24282B",
      defaultHoverBg: "#627254",
      defaultHoverColor: "#D9D9D9",
    },
    Checkbox: {
      colorPrimary: "#627254",
    },
  },
};
