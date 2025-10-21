export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  DASHBOARD: "/dashboard",
  AUTH: "/auth",
  LOGIN: "login",
  REGISTER: "register",

  DEALER_STAFF: "/dealer-staff",
  EVM_STAFF: "/evm-staff",
  MANAGER: "/manager",
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
