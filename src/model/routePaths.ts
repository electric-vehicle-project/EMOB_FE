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
  DEALERS: "dealers",
  CUSTOMERS: "customers",
  CUSTOMER_CREATE: "customers/create",
  CUSTOMER_DETAIL: "customers/:id",
  CUSTOMER_EDIT: "customers/edit/:id",

  // ====== ADMIN MODULES ======
  TESTDRIVE: "testdrive",
  REPORT: "report",
  PROMOTIONS: "promotions",
  PROMOTION_EDIT: "promotions/edit/:id",

  // Hồ sơ người dùng
  PROFILE_INFO: "profile/info",
  PROFILE_CHANGE: "profile/changeInfo",
  PROFILE_RESET: "profile/resetpassword",
  PROFILE_SCHEDULE: "profile/viewSchedule",

  // ====== PROMOTIONS ======
  PROMOTIONS: "promotions",
  PROMOTION_CREATE: "promotions/create",
  PROMOTION_EDIT: "promotions/edit/:id",
  NOTFOUND: "/*",

  // ====== QUOTATION ======
  QUOTATIONS: "quotations",
  QUOTATION_CREATE: "quotations/create",
  QUOTATION_UPDATE: "quotations/edit/:id",
  QUOTATION_VIEW: "quotations/view/:id",
  QUOTATION_APPROVE: "quotation/approve/:id",
  // EVM
  EVM_VEHICLE: "evm/vehicle",
  EVM_VEHICLE_BULK: "evm/vehicle/bulk",
  EVM_VEHICLE_RULES: "evm/price-rules",
  EVM_VEHICLE_NEW: "evm/vehicle/new",
  EVM_VEHICLE_DETAIL: "evm/vehicle/:id",
  EVM_VEHICLE_EDIT: "evm/vehicle/edit/:id",
  EVM_VEHICLE_PRICE_UPDATE: "evm/vehicle/prices/:id",

  // VEHICLE-REQUEST
  VEHICLE_REQUEST: "vehicle-request",
  VEHICLE_REQUEST_CREATE: "vehicle-request/create",
  VEHICLE_REQUEST_UPDATE: "vehicle-request/edit/:id",

  // DEALER_DISCOUNT_POLICY
  DEALER_DISCOUNT_POLICY: "dealer-discount-policy",
};
