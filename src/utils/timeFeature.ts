import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Set default timezone
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

export const getCurrentDateTime = () => {
  return dayjs().format("MMMM Do YYYY, h:mm:ss a");
};

export const getDifTime = (dateStart: string) => {
  return dayjs(dateStart, "MMMM Do YYYY, h:mm:ss a").fromNow();
};

export const getCurrentDateTimeVietnam = () => {
  return dayjs().tz("Asia/Ho_Chi_Minh").format("MMMM Do YYYY, h:mm:ss a");
};

export const formatDateVietnam = (date: string | Date | number) => {
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("MMMM Do YYYY");
};

export const formatDateTimeVietnam = (date: string | Date | number) => {
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("MMMM Do YYYY, h:mm:ss a");
};
