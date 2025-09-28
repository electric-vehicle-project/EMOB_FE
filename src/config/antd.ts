import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  components: {
    Button: {
      // Màu Default (Mặc định)
      defaultBg: "#24282B", // nền
      defaultColor: "#D9D9D9", // chữ

      defaultHoverBg: "#3a3b64", // nền hover
      defaultHoverColor: "#D9D9D9", // chữ hover

      controlOutline: "none",

      // Màu Primary
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
      colorPrimaryActive: "#414d38",
      colorPrimaryBg: "#627254",
    },
  },
};
