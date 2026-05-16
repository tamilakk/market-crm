// Центральное место для форматирования — менять валюту/локаль только здесь
export const LOCALE = "ru-KZ";
export const CURRENCY = "₸";
export const CITY = "Қарағанды";

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("ru-KZ")} ${CURRENCY}`;
}

export function formatDate(date: Date, fmt: string = "d MMM yyyy"): string {
  return date.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" });
}
