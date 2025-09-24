import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#627254",
    colorBgSolidHover: "#76885B",
    colorPrimaryHover: "#76885B",
    colorBorder: "#627254",
    colorBgContainer: "#24282B",
  },

  components: {
    Button: {
      //Màu primary
      colorPrimary: "#627254",
      colorPrimaryHover: "#76885B",
      colorTextLightSolid: "#D9D9D9",

      //Màu default
      colorBgContainer: "#24282B",
      colorText: "#D9D9D9",
      defaultHoverBg: "#76885B",
      defaultHoverColor: "#D9D9D9",

      //Style
      borderRadius: 12,
      controlHeight: 59, //chiều cao mặc định
      controlHeightLG: 59, //chiều cao của size="large"
      controlHeightSM: 49, //chiều cao của size="small"
      paddingContentHorizontal: 59,

      //Style cho text
      fontFamily: "Roboto, sans-serif",
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 36,
    },
  },
};
