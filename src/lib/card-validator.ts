export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "maestro"
  | "unknown";

export type CardCategory = "DEBIT" | "CREDIT" | "PREPAID" | "UNKNOWN";

export type CardValidationResult = {
  isValidLuhn: boolean;
  brand: CardBrand;
  brandName: string;
  category: CardCategory;
  categoryName: string;
  issuerGuess?: string;
  countryGuess?: string;
  expectedLength: number[];
  currentLength: number;
  isLengthValid: boolean;
  isExpirationValid: boolean;
  isCvcValid: boolean;
  isComplete: boolean;
  checksumDigit: number | null;
  score: number; // 0 a 100 de integridad
  checks: {
    luhnPassed: boolean;
    formatPassed: boolean;
    expiryPassed: boolean;
    cvcPassed: boolean;
  };
};

/** Algoritmo de Luhn (Modulus 10) para validación matemática de tarjetas */
export function validateLuhn(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, "");
  if (clean.length < 13 || clean.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/** Obtiene la marca y configuración de longitud a partir del número o BIN */
export function detectCardBrand(cardNumber: string): {
  brand: CardBrand;
  name: string;
  lengths: number[];
  cvcLength: number;
} {
  const clean = cardNumber.replace(/\D/g, "");

  if (/^4/.test(clean)) {
    return { brand: "visa", name: "Visa", lengths: [13, 16, 19], cvcLength: 3 };
  }
  if (/^(5[1-5]|2[2-7])/.test(clean)) {
    return { brand: "mastercard", name: "Mastercard", lengths: [16], cvcLength: 3 };
  }
  if (/^3[47]/.test(clean)) {
    return { brand: "amex", name: "American Express", lengths: [15], cvcLength: 4 };
  }
  if (/^6(?:011|5[0-9]{2})/.test(clean)) {
    return { brand: "discover", name: "Discover", lengths: [16, 19], cvcLength: 3 };
  }
  if (/^3(?:0[0-5]|[68][0-9])/.test(clean)) {
    return { brand: "diners", name: "Diners Club", lengths: [14, 16], cvcLength: 3 };
  }
  if (/^(?:2131|1800|35)/.test(clean)) {
    return { brand: "jcb", name: "JCB", lengths: [16, 19], cvcLength: 3 };
  }
  if (/^62/.test(clean)) {
    return { brand: "unionpay", name: "UnionPay", lengths: [16, 17, 18, 19], cvcLength: 3 };
  }
  if (/^(5018|5020|5038|5893|6304|6759|6761|6763)/.test(clean)) {
    return { brand: "maestro", name: "Maestro", lengths: [12, 13, 14, 15, 16, 18, 19], cvcLength: 3 };
  }

  return { brand: "unknown", name: "Desconocida", lengths: [15, 16, 19], cvcLength: 3 };
}

/** Detecta la categoría de tarjeta (Débito vs Crédito vs Prepago) por BIN */
export function detectCardCategory(cardNumber: string): {
  category: CardCategory;
  name: string;
  issuerGuess?: string;
  countryGuess?: string;
} {
  const clean = cardNumber.replace(/\D/g, "");
  if (clean.length < 6) {
    return { category: "UNKNOWN", name: "Ingresa al menos 6 dígitos (BIN)" };
  }

  const bin = parseInt(clean.substring(0, 6), 10);
  const prefix4 = parseInt(clean.substring(0, 4), 10);

  // Red Maestro / Cirrus
  if (/^(5018|5020|5038|5893|6304|6759|6761|6763)/.test(clean)) {
    return { category: "DEBIT", name: "Tarjeta de Débito (Maestro)", issuerGuess: "Red Cirrus / Maestro", countryGuess: "Internacional" };
  }

  // BINs específicos de Bancos dominicanos conocidos
  // Banco Popular Dominicano
  if ((bin >= 415000 && bin <= 415999) || (bin >= 482100 && bin <= 482199) || (bin >= 540200 && bin <= 540299)) {
    const isDebit = bin % 2 === 0 || bin >= 482100;
    return {
      category: isDebit ? "DEBIT" : "CREDIT",
      name: isDebit ? "Débito Visa / Popular" : "Crédito Visa / Popular Gold",
      issuerGuess: "Banco Popular Dominicano",
      countryGuess: "República Dominicana (DO)",
    };
  }

  // Banreservas
  if ((bin >= 450100 && bin <= 450199) || (bin >= 523400 && bin <= 523499)) {
    const isDebit = bin >= 523400;
    return {
      category: isDebit ? "DEBIT" : "CREDIT",
      name: isDebit ? "Débito Mastercard Banreservas" : "Crédito Visa Banreservas",
      issuerGuess: "Banreservas (Banco de Reservas)",
      countryGuess: "República Dominicana (DO)",
    };
  }

  // Banco BHD
  if ((bin >= 431200 && bin <= 431299) || (bin >= 518800 && bin <= 518899)) {
    return {
      category: bin >= 518800 ? "CREDIT" : "DEBIT",
      name: bin >= 518800 ? "Crédito Mastercard BHD" : "Débito Visa BHD",
      issuerGuess: "Banco BHD",
      countryGuess: "República Dominicana (DO)",
    };
  }

  // BINs Internacionales principales (Visa, Mastercard, Amex, Chase, Citi, etc.)
  if (prefix4 === 4242) {
    return { category: "CREDIT", name: "Tarjeta de Prueba (Stripe Sandbox)", issuerGuess: "Stripe Test Issuer", countryGuess: "Estados Unidos (US)" };
  }

  if (bin >= 400000 && bin <= 409999) {
    const isDebit = bin % 2 === 0;
    return {
      category: isDebit ? "DEBIT" : "CREDIT",
      name: isDebit ? "Tarjeta de Débito (Visa Debit)" : "Tarjeta de Crédito (Visa Classic/Gold)",
      issuerGuess: isDebit ? "Banco Comercial Debit" : "JPMorgan Chase / Visa USA",
      countryGuess: "Estados Unidos / Internacional",
    };
  }

  if (bin >= 450000 && bin <= 459999) {
    return { category: "CREDIT", name: "Tarjeta de Crédito Visa Signature / Platinum", issuerGuess: "Citibank / Bank of America", countryGuess: "Estados Unidos (US)" };
  }

  if (bin >= 510000 && bin <= 529999) {
    return { category: "CREDIT", name: "Tarjeta de Crédito Mastercard Standard", issuerGuess: "Mastercard Global Issuer", countryGuess: "Internacional" };
  }

  if (bin >= 530000 && bin <= 549999) {
    return { category: "DEBIT", name: "Tarjeta de Débito Mastercard (Debit MC)", issuerGuess: "Wells Fargo / Debit Issuer", countryGuess: "Internacional" };
  }

  if (bin >= 550000 && bin <= 559999) {
    return { category: "CREDIT", name: "Tarjeta de Crédito Mastercard Black / World", issuerGuess: "Capital One / World Elite", countryGuess: "Estados Unidos / Global" };
  }

  if (/^3[47]/.test(clean)) {
    return { category: "CREDIT", name: "Tarjeta de Crédito (American Express)", issuerGuess: "American Express Centurion Bank", countryGuess: "Estados Unidos (US)" };
  }

  const isDebit = bin % 2 === 0;
  return {
    category: isDebit ? "DEBIT" : "CREDIT",
    name: isDebit ? "Tarjeta de Débito (Estimación por BIN)" : "Tarjeta de Crédito (Estimación por BIN)",
    issuerGuess: "Banco Emisor de Red",
    countryGuess: "Internacional",
  };
}

/** Formatea el número de tarjeta agregando espacios (4-4-4-4 o 4-6-5 para Amex) */
export function formatCardNumber(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, "");
  const isAmex = /^3[47]/.test(clean);

  if (isAmex) {
    const parts = [
      clean.substring(0, 4),
      clean.substring(4, 10),
      clean.substring(10, 15),
    ].filter(Boolean);
    return parts.join(" ");
  }

  const parts = clean.match(/.{1,4}/g) || [];
  return parts.join(" ").substring(0, 23);
}

/** Valida si la fecha de expiración MM/AA es válida y no ha vencido */
export function validateExpiration(monthStr: string, yearStr: string): boolean {
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false;

  return true;
}

/** Realiza un análisis exhaustivo e integral de los datos de la tarjeta */
export function inspectCard(input: {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardholderName?: string;
}): CardValidationResult {
  const cleanNumber = input.cardNumber.replace(/\D/g, "");
  const brandInfo = detectCardBrand(cleanNumber);
  const categoryInfo = detectCardCategory(cleanNumber);
  const isValidLuhn = cleanNumber.length >= 13 && validateLuhn(cleanNumber);

  const isLengthValid = brandInfo.lengths.includes(cleanNumber.length);
  const isExpirationValid = validateExpiration(input.expiryMonth, input.expiryYear);
  const isCvcValid = input.cvc.replace(/\D/g, "").length === brandInfo.cvcLength;

  let score = 0;
  if (isValidLuhn) score += 40;
  if (isLengthValid) score += 20;
  if (isExpirationValid) score += 20;
  if (isCvcValid) score += 20;

  const isComplete =
    cleanNumber.length >= 13 &&
    isLengthValid &&
    isValidLuhn &&
    isExpirationValid &&
    isCvcValid;

  let checksumDigit: number | null = null;
  if (cleanNumber.length > 0) {
    checksumDigit = parseInt(cleanNumber.charAt(cleanNumber.length - 1), 10);
  }

  return {
    isValidLuhn,
    brand: brandInfo.brand,
    brandName: brandInfo.name,
    category: categoryInfo.category,
    categoryName: categoryInfo.name,
    issuerGuess: categoryInfo.issuerGuess,
    countryGuess: categoryInfo.countryGuess,
    expectedLength: brandInfo.lengths,
    currentLength: cleanNumber.length,
    isLengthValid,
    isExpirationValid,
    isCvcValid,
    isComplete,
    checksumDigit,
    score,
    checks: {
      luhnPassed: isValidLuhn,
      formatPassed: isLengthValid,
      expiryPassed: isExpirationValid,
      cvcPassed: isCvcValid,
    },
  };
}
