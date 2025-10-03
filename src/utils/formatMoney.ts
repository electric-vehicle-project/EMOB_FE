/**
 * Định dạng số thành tiền tệ Việt Nam (VND)
 *
 * @param amount - số tiền cần định dạng (number)
 * @returns string - chuỗi định dạng, ví dụ "1.000.000 ₫"
 *
 * Ví dụ:
 *   formatMoney(1000000) => "1.000.000 ₫"
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
