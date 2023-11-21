export function isValidPhoneNumber(input: string): boolean {
  // Remove non-digit characters from the phone number
  const phoneNumber = input.replace(/\D/g, "");

  // Validate the phone number format
  const phoneRegex = /^(?:\+?1\s?)?(?:\(\d{3}\)|\d{3})(?:[-.\s]?)\d{3}(?:[-.\s]?)\d{4}$/;
  return phoneRegex.test(phoneNumber);
}

export function clearFormat(value: string): string {
  const replacedNumber: string = value.replace(/\D/g, "");

  // Add US country code by default if not added
  return replacedNumber.length <= 10 ? "1" + replacedNumber : replacedNumber;
}

export function isValidCreditCardNumber(input: string): boolean {
  // Remove non-digit characters from the credit card number
  const cleanedNumber = input.replace(/\D/g, "");

  // Check if the number is empty or doesn't contain only digits
  if (!cleanedNumber || !/^\d+$/.test(cleanedNumber)) {
    return false;
  }

  //  Use the Luhn algorithm to validate the credit card number
  let sum = 0;
  let double = false;

  for (let i = cleanedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanedNumber[i], 10);

    if (double) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

export function numberTo2Digit(value: number) {
  // Return all numbers with 2 digits
  return value < 10 ? `0${value}` : value;
}
