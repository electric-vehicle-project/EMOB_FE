import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    Input: {
      borderRadius: 9999,
      colorBgContainer: "white",
      activeBorderColor: "#627254",
      activeShadow: "0 0 0 2px rgba(98, 114, 84, 0.2)",
      hoverBorderColor: "#525e46",
      colorText: "var(--primary-color)",
      colorTextPlaceholder: "#bfbfbf",
    },

    Button: {
      // Default
      defaultBg: "#24282B",
      defaultColor: "#D9D9D9",
      defaultBorderColor: "#24282B",
      defaultHoverBg: "#2E3338",
      defaultHoverColor: "#D9D9D9",
      defaultHoverBorderColor: "#2E3338",
      defaultActiveBg: "#2E3338",
      defaultActiveColor: "#D9D9D9",
      defaultActiveBorderColor: "#2E3338",
      controlOutline: "none",

      // Primary (EMOB)
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
      colorPrimaryActive: "#414d38",
      colorPrimaryBg: "#627254",
      borderRadius: 9999,

      // Default solid
      colorBgSolid: "#24282B",
    },

    Checkbox: {
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
    },

    // 💡 Thêm cấu hình cho Table để màu sắc đồng bộ
    Table: {
      headerBg: "#414d38", // nền header
      headerColor: "#ffffff", // chữ header
      headerSplitColor: "#627254", // vạch ngăn th giữa các th
      borderColor: "#627254", // màu viền tổng thể
      rowHoverBg: "rgba(98,114,84,0.06)",
      headerSortHoverBg: "#525e46",
    },

    // (tuỳ chọn) Pagination cho đồng bộ focus/hover
    Pagination: {
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
    },
  },



  
};


