export const MONTHS: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getMonthName = (monthNumber: number): string => {
  if (monthNumber < 1 || monthNumber > 12) return "Invalid";
  return MONTHS[monthNumber - 1];
};

export const getMonthNameVI = (monthNumber: number): string => {
  if (monthNumber < 1 || monthNumber > 12) return "Tháng không hợp lệ";
  return `Tháng ${monthNumber}`;
};
