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
  LOGIN: "login",
  REGISTER: "register",
  FORGET_PASSWORD: "forget-password",
  FORGET_PASSWORD_OTP: "forget-password-otp",
  RESET_PASSWORD: "reset-password",

  // ====== CUSTOMERS ======
  CUSTOMERS: "customers",
  CUSTOMER_CREATE: "customers/create",
  CUSTOMER_DETAIL: "customers/:id",
  CUSTOMER_EDIT: "customers/edit/:id",

  // ====== ADMIN MODULES ======
  DEALERS: "dealers",
  TESTDRIVE: "testdrive",
  REPORT: "report",

  // ====== PROFILE ======
  PROFILE_INFO: "profile/info",
  PROFILE_CHANGE: "profile/changeInfo",
  PROFILE_RESET: "profile/resetpassword",
  PROFILE_SCHEDULE: "profile/viewSchedule",

  // ====== PROMOTIONS ======
  PROMOTIONS: "promotions",
  PROMOTION_CREATE: "promotions/create",
  PROMOTION_EDIT: "promotions/edit/:id",
  NOTFOUND: "/*",
};
