import moment from "moment";

/**
 * Returns the current date and time in UTC format as an ISO 8601 string.
 *
 * @returns {String} The current date and time in UTC, formatted as an ISO 8601 string. Example: "2025-01-01T00:00:00.000Z"
 */
export function getCurrentDateTimeInUTC() {
    return moment.utc().toISOString();
}
