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
      activeShadow: "0 0 0 2px rgba(98,114,84,0.2)",
      hoverBorderColor: "#525e46",
      colorText: "var(--primary-color)",
      colorTextPlaceholder: "#bfbfbf",
    },

    Button: {
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

      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
      colorPrimaryActive: "#414d38",
      colorPrimaryBg: "#627254",
      borderRadius: 9999,

      controlHeightSM: 40,
      borderRadiusSM: 9999,
    },

    Checkbox: {
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
    },

    Table: {
      headerBg: "#414d38",
      headerColor: "#ffffff",
      headerSplitColor: "#627254",
      borderColor: "#627254",
      rowHoverBg: "rgba(98,114,84,0.06)",
      headerSortHoverBg: "#525e46",

      headerSortActiveBg: "#525e46",
    },

    Pagination: {
      colorPrimary: "#627254",
      colorPrimaryHover: "#525e46",
    },

    Dropdown: {
      colorBgElevated: "#ffffff",
      controlItemBgHover: "rgba(98, 114, 84, 0.08)",
      borderRadius: 12,
      boxShadowSecondary: "0 4px 20px rgba(0,0,0,0.08)",
    },
  },
};
