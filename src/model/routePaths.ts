export const ROUTES = {
  // ====== HOMEPAGE ======
  HOME: "/",

  // ====== ROLE ======
  ADMIN: "/admin",
  MANAGER: "/manager",
  DEALER_STAFF: "/dealer_staff",
  EVM_STAFF: "/evm_staff",

  // ====== DASHBOARD ======
  DASHBOARD: "/dashboard",

  // ====== AUTHENTICATION ======
  AUTH: "/auth",

  // Auth
  LOGIN: "login",
  REGISTER: "register",
  FORGET_PASSWORD: "forget-password",
  FORGET_PASSWORD_OTP: "forget-password-otp",
  RESET_PASSWORD: "reset-password",

  // Quản lý dữ liệu
  CUSTOMERS: "customers",
  CUSTOMER_CREATE: "customers/create",
  CUSTOMER_DETAIL: "customers/:id",
  CUSTOMER_EDIT: "customers/edit/:id",

  // Lịch lái thử
  TEST_DRIVE: "test-drive",
  TEST_DRIVE_ALL: "test-drive/schedules",
  TEST_DRIVE_NEW: "test-drive/new",
  TEST_DRIVE_EDIT: "test-drive/edit/:id",
  TEST_DRIVE_DETAIL: "test-drive/:id",

  // Đại lý
  DEALERS: "dealers",

  // Báo cáo
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
