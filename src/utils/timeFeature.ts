import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Set default timezone
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

/**
 * Lấy ngày giờ hiện tại theo local của máy
 * @returns {string} - ví dụ "September 21st 2025, 9:30:15 am"
 */
export const getCurrentDateTime = (): string => {
  return dayjs().format("MMMM Do YYYY, h:mm:ss a");
};

/**
 * Tính khoảng thời gian từ `dateStart` đến hiện tại dưới dạng relative time
 * @param {string} dateStart - ngày giờ bắt đầu, format "MMMM Do YYYY, h:mm:ss a"
 * @returns {string} - ví dụ "2 hours ago", "3 days ago"
 */
export const getDifTime = (dateStart: string): string => {
  return dayjs(dateStart, "MMMM Do YYYY, h:mm:ss a").fromNow();
};

/**
 * Lấy ngày giờ hiện tại theo múi giờ Việt Nam
 * @returns {string} - ví dụ "September 21st 2025, 9:30:15 am"
 */
export const getCurrentDateTimeVietnam = (): string => {
  return dayjs().tz("Asia/Ho_Chi_Minh").format("MMMM Do YYYY, h:mm:ss a");
};

/**
 * Định dạng ngày theo múi giờ Việt Nam, chỉ lấy ngày/tháng/năm
 * @param {string | Date | number} date - ngày cần định dạng
 * @returns {string} - ví dụ "September 21st 2025"
 */
export const formatDateVietnam = (date: string | Date | number): string => {
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("MMMM Do YYYY");
};

/**
 * Định dạng ngày giờ đầy đủ theo múi giờ Việt Nam
 * @param {string | Date | number} date - ngày cần định dạng
 * @returns {string} - ví dụ "September 21st 2025, 9:30:15 am"
 */
export const formatDateTimeVietnam = (date: string | Date | number): string => {
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("MMMM Do YYYY, h:mm:ss a");
};
