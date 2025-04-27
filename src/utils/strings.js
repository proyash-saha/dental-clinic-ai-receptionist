// eslint-disable-next-line @stylistic/js/max-len
export const REQUIRED_PATIENT_FIELDS = ["phoneNumber", "email", "firstName", "lastName", "notes", "initialCallbackComplete", "createdAt", "modifiedAt"];

export function isValidPhoneNumber(phoneNumber) {
    return phoneNumber && typeof phoneNumber === "string" && /^\d{10}$/.test(phoneNumber);
}
