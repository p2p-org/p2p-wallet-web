export function validatePassword(password: string) {
  const isLowerCase = /[a-z]/.test(password);
  const isUpperCase = /[A-Z]/.test(password);
  const isNumber = /\d/.test(password);
  const isMinLength = password.length >= 8;

  return { isLowerCase, isUpperCase, isNumber, isMinLength };
}
