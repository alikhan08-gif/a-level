// Keep only digits, a leading "+", and spaces — blocks letters/symbols
// while still letting the user type "+998 90 123 45 67" naturally.
export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\s]/g, "");
}
