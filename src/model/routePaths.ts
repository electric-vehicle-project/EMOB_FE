export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  DASHBOARD: "/dashboard",
  AUTH: "/auth",

  // Auth
  LOGIN: "login",
  FORGET_PASSWORD: "forget-password",
  FORGET_PASSWORD_OTP: "forget-password-otp",
  RESET_PASSWORD: "reset-password",

  // Quản lý dữ liệu
  DEALERS: "dealers",
  CUSTOMERS: "customers",
  TESTDRIVE: "testdrive",
  REPORT: "report",

  // Hồ sơ người dùng
  PROFILE_INFO: "profile/info",
  PROFILE_CHANGE: "profile/changeInfo",
  PROFILE_RESET: "profile/resetpassword",
  PROFILE_SCHEDULE: "profile/viewSchedule",

  // EVM
  EVM_VEHICLE: "evm/vehicle",
  EVM_VEHICLE_BULK: "evm/vehicle/bulk",
  EVM_VEHICLE_RULES: "evm/price-rules",
  EVM_VEHICLE_NEW: "evm/vehicle/new",
  EVM_VEHICLE_DETAIL: "evm/vehicle/:id",
  EVM_VEHICLE_EDIT: "evm/vehicle/edit/:id",
  EVM_VEHICLE_PRICE_UPDATE: "evm/vehicle/prices/:id",

  // 404
  NOTFOUND: "*",
};
