// src/model/routePaths.ts
export const ROUTES = {
  // Hệ thống chính
  HOME: "/",
  ADMIN: "/admin",
  DASHBOARD: "/dashboard",

  // Auth
  AUTH: "/auth",
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
  PROFILE: "profile",
  PROFILE_INFO: "profile/info",
  PROFILE_CHANGE: "profile/changeInfo",
  PROFILE_RESET: "profile/resetpassword",
  PROFILE_SCHEDULE: "profile/viewSchedule",

  // Quản lý xe điện (Electric Vehicle Management)
  EVM: "evm",
  EVM_VEHICLE: "evm/vehicle", // Trang chính CRUD xe điện
  EVM_VEHICLE_BULK: "evm/vehicle/bulk", // Trang nhập hàng loạt đơn vị xe (vehicle units)

  // Trang lỗi
  NOTFOUND: "/*",
};
