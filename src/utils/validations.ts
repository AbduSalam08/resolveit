/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */

import dayjs from "dayjs";

/**
 *
 * Checks if a value is not empty or within the specified length.
 * @param value The value to check.
 * @param isLength If true, checks if the length is within 255 characters.
 * @returns true if the value is not empty or within the specified length, false otherwise.
 */
const emptyCheck = (value: string | any, isLength?: boolean): boolean => {
  // Ensure the value is a string, or handle it accordingly if it's not
  if (typeof value !== "string") {
    return false;
  }

  // If isLength is not true, check if the trimmed value is non-empty and within the length limit
  if (!isLength) {
    return value.trim() !== "" && value.trim().length <= 255;
  }

  // If isLength is true, only check for non-empty trimmed string
  return value.trim() !== "";
};

/**
 * Validates a fax number.
 * @param value The fax number to validate.
 * @returns true if the fax number is valid, false otherwise.
 */
const validateFaxNumber = (value: string | undefined): boolean => {
  return !!value?.trim() && value.length! <= 20;
};

/**
 * Validates a web URL.
 * @param value The web URL to validate.
 * @returns true if the web URL is valid, false otherwise.
 */
const validateWebURL = (value: string | undefined): boolean => {
  const webURLRegEx =
    /^(https?:\/\/)?(www\.)?([a-zA-Z0-9.-]+)(\.[a-zA-Z]{2,})(:\d+)?(\/[\w~.?+=&%@!\-:/]*)*(#[\w\-]*)?$/;
  return webURLRegEx.test(value!);
};

/**
 * Validates a password.
 * @param password The password to validate.
 * @returns true if the password is valid, false otherwise.
 */
const validatePassword = (password: string | undefined): boolean => {
  const passwordRegex =
    /^(?!.*\s)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;
  return !!password && passwordRegex.test(password) && password.length! <= 255;
};

/**
 * Validates an alphanumeric value.
 * @param value The value to validate.
 * @returns true if the value is alphanumeric, false otherwise.
 */
const validateAlphaNumeric = (value: string | undefined): boolean => {
  const alphaNumeric = /^[a-zA-Z0-9]+$/;
  return alphaNumeric.test(value!);
};

/**
 * Validates a company registration number.
 * @param value The company registration number to validate.
 * @returns true if the company registration number is valid, false otherwise.
 */
const validateCompanyRegistrationNumber = (
  value: string | undefined
): boolean => {
  const alphaNumeric = /^[a-zA-Z0-9]/;
  return alphaNumeric.test(value!) && value!.length <= 255;
};

/**
 * Validates a select input.
 * @param label The label value.
 * @param selectedValue The selected value to validate.
 * @returns true if the selected value is not empty and not equal to the label, false otherwise.
 */
const validateSelect = (
  label: string | undefined,
  selectedValue: string | undefined
): boolean => {
  return !!selectedValue?.trim() && selectedValue !== label;
};

/**
 * Validates a phone number.
 * @param phoneNumber The phone number to validate.
 * @returns true if the phone number is valid, false otherwise.
 */
const validatePhoneNumber = (phoneNumber: string | undefined): boolean => {
  return (
    !!phoneNumber?.trim() || phoneNumber !== "+" || phoneNumber?.length !== 1
  );
};

/**
 * Validates an email address.
 * @param emailAddress The email address to validate.
 * @returns true if the email address is valid, false otherwise.
 */
const validateEmail = (emailAddress: string | undefined): boolean => {
  const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const disallowedRegex = /["(),:;<>[\]\\]/;
  const consecutiveDotsRegex = /[.]{2}/;
  const consecutiveDomainDotsRegex = /(@)[^.]+[.]{2,}(?=[^.]+)/;
  const domainTldLengthRegex = /(@)[^.]+[.][^.]{1,1}$/;
  const ipAddressRegex = /(@)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  const isValid =
    basicRegex.test(emailAddress!) &&
    !disallowedRegex.test(emailAddress!) &&
    !consecutiveDotsRegex.test(emailAddress!) &&
    !consecutiveDomainDotsRegex.test(emailAddress!) &&
    !domainTldLengthRegex.test(emailAddress!) &&
    !ipAddressRegex.test(emailAddress!);
  return isValid;
};

/**
 * Validates a PAN card number.
 * @param value The PAN card number to validate.
 * @returns true if the PAN card number is valid, false otherwise.
 */
const validatePAN = (value: string | undefined): boolean => {
  const panRegex = /^([A-Z]{5})(\d{4})([A-Z]{1})$/;
  return panRegex.test(value!);
};

/**
 * Checks if a file is empty.
 * @param value The file to check.
 * @returns true if the file is empty, false otherwise.
 */
const checkFile = (value: any): boolean => {
  return value === "" || value?.length === 0;
};

/**
 * Converts a file to a base64 string.
 * @param file The file to convert.
 * @param callback The callback function to invoke after conversion.
 */
const convertToBASE64 = (
  file: File | null,
  callback: (base64String: string) => void
): void => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target?.result as string;
    callback(base64String);
  };
  reader.readAsDataURL(file);
};

const trimStartEnd = (value: string): string => {
  const trimmedValueStart = value?.trimStart();
  const trimmedValueEnd = trimmedValueStart?.trimEnd();
  return trimmedValueEnd;
};

// keyboardUtils.ts
export const handleKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>,
  value: string,
  onChange: (newValue: string) => void
): void => {
  const inputElement = event.target as HTMLInputElement;
  const { selectionStart, selectionEnd } = inputElement;

  // Handle space key
  if (event.key === " ") {
    event.preventDefault();
    const newValue =
      value?.slice(0, selectionStart!) + " " + value.slice(selectionEnd!);
    onChange(newValue);
    setTimeout(() => {
      inputElement.selectionStart = inputElement.selectionEnd =
        selectionStart! + 1;
    }, 0);
  }

  // Handle Ctrl+A (Select All)
  if (event.ctrlKey && event.key === "a") {
    event.preventDefault();
    inputElement.selectionStart = 0;
    inputElement.selectionEnd = value.length;
  }

  // Handle Ctrl+C (Copy)
  if (event.ctrlKey && event.key === "c") {
    event.preventDefault();
    const selectedText = value.slice(selectionStart!, selectionEnd!);
    navigator.clipboard.writeText(selectedText);
  }

  // Handle Ctrl+V (Paste)
  if (event.ctrlKey && event.key === "v") {
    event.preventDefault();
    navigator.clipboard.readText().then((clipboardText) => {
      const newValue =
        value.slice(0, selectionStart!) +
        clipboardText +
        value.slice(selectionEnd!);
      onChange(newValue);
      setTimeout(() => {
        inputElement.selectionStart = inputElement.selectionEnd =
          selectionStart! + clipboardText.length;
      }, 0);
    });
  }
};
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
export const calculateDueDateByRole = (
  startDate: string,
  role:
    | "document"
    | "content developer"
    | "consultant"
    | "approver"
    | "reviewer"
): any => {
  const start = dayjs(startDate, "DD/MM/YYYY");
  let dueDate;

  switch (role.toLowerCase()) {
    case "document":
      dueDate = start.add(90, "day").format("DD/MM/YYYY");
      break;
    case "content developer":
      dueDate = start.add(30, "day").format("DD/MM/YYYY");
      break;
    case "consultant":
      dueDate = start.add(30, "day").format("DD/MM/YYYY");
      break;
    case "approver":
      dueDate = start.add(7, "day").format("DD/MM/YYYY");
      break;
    case "reviewer":
      dueDate = start.add(7, "day").format("DD/MM/YYYY");
      break;
    default:
      dueDate = "Invalid role";
  }

  return dueDate;
};

export {
  trimStartEnd,
  validateEmail,
  emptyCheck,
  validatePassword,
  validateSelect,
  validatePhoneNumber,
  validatePAN,
  checkFile,
  validateWebURL,
  validateAlphaNumeric,
  validateCompanyRegistrationNumber,
  validateFaxNumber,
  convertToBASE64,
};
