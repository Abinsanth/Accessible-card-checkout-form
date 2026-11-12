export function luhnCheck(digits: string): boolean {
  let total = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);

    if (double) {
      n = n * 2;
      if (n > 9) n = n - 9;
    }
    total += n;
    double = !double;
  }

  return total % 10 === 0;
}

export type Network = "visa" | "mastercard" | "amex" | null;

export function detectNetwork(digits: string): Network {
  // Visa: starts with 4
  if (digits.startsWith("4")) return "visa";

  // Amex: starts with 34 or 37
  if (digits.startsWith("34") || digits.startsWith("37")) return "amex";

  // Mastercard (old range): first 2 digits between 51 and 55
  const firstTwo = Number(digits.slice(0, 2));
  if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";

  // Mastercard (new range): first 4 digits between 2221 and 2720
  const firstFour = Number(digits.slice(0, 4));
  if (firstFour >= 2221 && firstFour <= 2720) return "mastercard";

  return null;
}

export function hasValidLength(digits: string): boolean {
  const network = detectNetwork(digits);
  const size = network === "amex" ? 15 : 16;
  return digits.length === size;
}

export function isValidExpiry(
  value: string,
  today: Date = new Date(),
): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;

  if (year > thisYear) return true;
  if (year === thisYear) return month >= thisMonth;
  return false;
}

export function isValidCvv(cvv: string, cardDigits: string): boolean {
  const size = detectNetwork(cardDigits) === "amex" ? 4 : 3;
  return /^\d+$/.test(cvv) && cvv.length === size;
}

export function isValidName(name: string): boolean {
  return name.trim().length > 0;
}

export function toDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string): string {
  const digits = toDigits(value).slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

export function formatExpiry(value: string): string {
  const digits = toDigits(value).slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}
