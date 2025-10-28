import {
  createQueryHook,
  createQueryWithPathParamHook,
  createMutationHook,
  deleteMutationHook,
} from "../hook/useApi";

const BASE_URL = "/sale-order";

// ======= GET ALL - DEALER =======
export const useSaleOrderOfDealer = (page = 0, size = 10) =>
  createQueryHook("saleOrderDealerList", `${BASE_URL}/of-dealer`)(
    {},
    { page, size }
  );

// ======= GET ALL - CUSTOMER =======
export const useSaleOrderOfCustomer = (page = 0, size = 10) =>
  createQueryHook("saleOrderCustomerList", `${BASE_URL}/of-customer`)(
    {},
    { page, size }
  );

// ======= GET BY ID =======
export const useSaleOrderById = createQueryWithPathParamHook(
  "saleOrderDetail",
  BASE_URL
);

/* =========================
      COMPLETE ORDER
      - Nếu payment_status = FULL → chỉ cần orderId
      - Nếu payment_status = INSTALLMENT → điền đủ field (deposit, downPayment, totalAmount, termMonths, interestRate)
   ========================= */
export const useSaleOrderComplete = createMutationHook(
  "saleOrderComplete",
  `${BASE_URL}/completed`
);

// ======= DELETE ORDER =======
export const useSaleOrderDelete = deleteMutationHook(
  "saleOrderDelete",
  BASE_URL
);
