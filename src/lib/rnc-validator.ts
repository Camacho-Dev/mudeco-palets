/**
 * Validador oficial de documentos de identidad fiscal de República Dominicana
 * - RNC (Sociedades / Personas Jurídicas): 9 dígitos (Algoritmo Módulo 11 DGII)
 * - Cédula (Personas Físicas): 11 dígitos (Algoritmo Módulo 10 / Luhn)
 */

export function cleanTaxId(raw?: string | null): string {
  if (!raw) return "";
  return raw.replace(/[^0-9]/g, "").trim();
}

export function validateRnc(rnc: string): boolean {
  const clean = cleanTaxId(rnc);
  if (clean.length !== 9) return false;

  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    sum += Number(clean[i]) * weights[i];
  }

  const remainder = sum % 11;
  let checkDigit = 0;

  if (remainder === 0) {
    checkDigit = 2;
  } else if (remainder === 1) {
    checkDigit = 1;
  } else {
    checkDigit = 11 - remainder;
  }

  return checkDigit === Number(clean[8]);
}

export function validateCedula(cedula: string): boolean {
  const clean = cleanTaxId(cedula);
  if (clean.length !== 11) return false;

  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    const mult = Number(clean[i]) * weights[i];
    sum += mult >= 10 ? Math.floor(mult / 10) + (mult % 10) : mult;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(clean[10]);
}

export function validateDominicanTaxId(raw?: string | null): {
  valid: boolean;
  type?: "RNC" | "CEDULA";
  clean: string;
  error?: string;
} {
  const clean = cleanTaxId(raw);
  if (!clean) {
    return { valid: true, clean: "" };
  }

  if (clean.length === 9) {
    const valid = validateRnc(clean);
    return {
      valid,
      type: "RNC",
      clean,
      error: valid ? undefined : "RNC de 9 dígitos inválido según el algoritmo DGII",
    };
  }

  if (clean.length === 11) {
    const valid = validateCedula(clean);
    return {
      valid,
      type: "CEDULA",
      clean,
      error: valid ? undefined : "Cédula de 11 dígitos inválida según el algoritmo de la JCE",
    };
  }

  return {
    valid: false,
    clean,
    error: "El RNC debe tener 9 dígitos o la Cédula 11 dígitos numéricos",
  };
}
