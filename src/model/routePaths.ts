export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  LOGIN: "login",
  REGISTER: "register",

  ADMIN: "/admin",
  DEALER_STAFF: "/dealer-staff",
  EVM_STAFF: "/evm-staff",
  DASHBOARD: "/dashboard",
  DEALER_MANAGER: "/dealer-manager",

  NOTFOUND: "/*",

  // ====== ADMIN MODULES ======
  DEALERS: "dealers",
  CUSTOMERS: "customers",
  CUSTOMER_DETAIL: "customers/:id",
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
  PROMOTION_EDIT: "promotions/:id/edit",
};
