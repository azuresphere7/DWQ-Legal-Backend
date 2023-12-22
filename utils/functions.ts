import * as fs from "fs/promises";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import sesClient from "../config/sesClient";

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

  // Check if the number is empty or doesn"t contain only digits
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

// Calculate the end date after the specific date
export function getEndDate(period: number) {
  const currentDate: Date = new Date();

  currentDate.setDate(currentDate.getDate() + period);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  };

  return currentDate.toLocaleString("en-US", options);
}

export async function sendEmail(to: string, subject: string, content: any) {
  if (!to || !subject || !content) {
    throw new Error("Missing parameters! Make sure to include to, subject, and content.");
  }

  const emailTemplate = await fs.readFile("./templates/order-notification-to-defendant.html", "utf-8");
  const htmlContent = emailTemplate.replace("${content}", content);

  const emailParams: SendEmailCommandInput = {
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlContent
        }
      }
    },
    Source: `"DWQ Legal Alerts" <${ process.env.AWS_SES_SOURCE_EMAIL }>`
  };

  console.log(`>> Sending email to: ${to}`);

  try {
    const data = await sesClient.send(new SendEmailCommand(emailParams));
    return data;
  }
  catch (error) {
    console.error(`Failed to send email: ${error}`);
    throw error; // Rethrow the error for the caller to handle
  }
}