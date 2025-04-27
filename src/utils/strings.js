export const REQUIRED_PATIENT_FIELDS = ["phoneNumber", "email", "firstName", "lastName", "createdAt", "modifiedAt"];

export function isValidPhoneNumber(phoneNumber) {
    return phoneNumber && typeof phoneNumber === "string" && /^\d{10}$/.test(phoneNumber);
}
