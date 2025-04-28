export const REQUIRED_PATIENT_FIELDS = ["phoneNumber", "email", "firstName", "lastName", "initialCallbackComplete", "createdAt", "modifiedAt"];

export function isValidPhoneNumber(phoneNumber) {
    const phoneNumberRegex = /^\d{10}$/;
    return phoneNumber && typeof phoneNumber === "string" && phoneNumberRegex.test(phoneNumber);
}

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && typeof email === "string" && emailRegex.test(email);
}
