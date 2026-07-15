import "server-only";

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phone: string) {
  return /^[0-9+().\-\s]{7,20}$/.test(phone);
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return null;
}

export function isValidZipCode(zip: string) {
  return /^[0-9A-Za-z\- ]{3,20}$/.test(zip);
}

export function isValidExpiryMonth(month: string) {
  return /^(0[1-9]|1[0-2])$/.test(month);
}

export function isValidExpiryYear(year: string) {
  if (!/^\d{4}$/.test(year)) {
    return false;
  }

  return Number(year) >= new Date().getFullYear();
}

export function isCardExpired(month: string, year: string) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const expiryYear = Number(year);
  const expiryMonth = Number(month);

  if (expiryYear < currentYear) {
    return true;
  }

  return expiryYear === currentYear && expiryMonth < currentMonth;
}

export function normalizeCardNumber(cardNumber: string) {
  return cardNumber.replace(/[\s-]/g, "");
}

export function isValidCardNumber(cardNumber: string) {
  return /^\d{13,19}$/.test(cardNumber);
}

export function detectCardType(cardNumber: string) {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^5[1-5]/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "American Express";
  if (/^6(?:011|5)/.test(cardNumber)) return "Discover";
  return "Card";
}
