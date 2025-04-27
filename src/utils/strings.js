export function isValidPhoneNumber(phoneNumber) {
    return phoneNumber && typeof phoneNumber === "string" && /^\d{10}$/.test(phoneNumber);
}
