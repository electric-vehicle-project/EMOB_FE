import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // ✅ thêm locale tiếng Việt

// Kích hoạt plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// ✅ Set locale tiếng Việt cho toàn bộ dayjs
dayjs.locale("vi");

// ✅ Set timezone mặc định là Việt Nam
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

/**
 * Lấy ngày giờ hiện tại theo local của máy
 * @returns {string} - ví dụ "21/09/2025 09:30:15"
 */
export const getCurrentDateTime = (): string => {
  return dayjs().format("DD/MM/YYYY HH:mm:ss");
};

/**
 * Tính khoảng thời gian từ `dateStart` đến hiện tại dưới dạng tương đối (tiếng Việt)
 * @param {string | Date | number} dateStart
 * @returns {string} - ví dụ "2 giờ trước", "3 ngày trước"
 */
export const getDifTime = (dateStart: string | Date | number): string => {
  return dayjs(dateStart).fromNow();
};

/**
 * Lấy ngày giờ hiện tại theo múi giờ Việt Nam
 * @returns {string} - ví dụ "21/09/2025 09:30:15"
 */
export const getCurrentDateTimeVietnam = (): string => {
  return dayjs().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
};

/**
 * Định dạng ngày theo múi giờ Việt Nam, chỉ lấy ngày/tháng/năm
 * @param {string | Date | number} date - ngày cần định dạng
 * @returns {string} - ví dụ "21/09/2025"
 */
export const formatDateVietnam = (date: string | Date | number): string => {
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
};

/**
 * Định dạng ngày giờ đầy đủ theo múi giờ Việt Nam (hiển thị tiếng Việt)
 * @param {string | Date | number} date - ngày cần định dạng
 * @returns {string} - ví dụ "21/09/2025 09:30:15"
 */
export const formatDateTimeVietnam = (date: string | Date | number): string => {
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
};
