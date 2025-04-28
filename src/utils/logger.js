import chalk from "chalk";

import fs from "fs";
import path from "path";

// Maximum number of days to keep logs
const MAX_LOG_DAYS = 10;

// Directory where logs will be stored
const LOG_DIR = path.join(process.cwd(), "logs");

// Ensure the log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

/**
 * Rotates logs by deleting files older than MAX_LOG_DAYS.
 */
function rotateLogs() {
    const files = fs.readdirSync(LOG_DIR);

    // Get the date MAX_LOG_DAYS ago
    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - MAX_LOG_DAYS);

    // Convert pastDate into a comparable string format (e.g., '2024-09-16')
    const pastDateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, "0")}-${String(pastDate.getDate()).padStart(2, "0")}`;

    // Loop through the files in the log directory
    files.forEach((file) => {
        const match = file.match(/app-(\d{4})-(\d{2})-(\d{2})\.log/);
        if (match) {
            const logDateStr = `${match[1]}-${match[2]}-${match[3]}`;
            if (logDateStr < pastDateStr) {
                // Delete log files older than MAX_LOG_DAYS
                fs.unlinkSync(path.join(LOG_DIR, file));
            }
        }
    });
}

/**
 * Generates the log file name based on the current date.
 *
 * @returns {String} The name of the log file (e.g., 'app-2024-09-26.log').
 */
function getLogFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `app-${year}-${month}-${day}.log`; // E.g., app-2024-09-26.log
}

/**
 * Writes a log message to the current day's log file and handles log rotation.
 * @param {String} logMessage - The message to log.
 */
function writeLogToFile(logMessage) {
    const logEntry = `${logMessage}\n\n`;

    // Append log to the current day's file
    const logFilePath = path.join(LOG_DIR, getLogFileName());
    fs.appendFileSync(logFilePath, logEntry);

    // Handle log rotation
    rotateLogs();
}

/**
 * Formats the log message based on its type.
 * @param {String|Object} message - The message to format. Can be a string or an object.
 *
 * @returns {String} The formatted message.
 */
function formatMessage(message) {
    if (typeof message === "object") {
        return JSON.stringify(message, null, 2);
    }

    return message;
}

/**
 * Gets the current date and time formatted as 'YYYY-MM-DD HH:MM AM/PM'.
 *
 * @returns {String} The formatted date and time.
 */
function getDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0"); // <-- Added seconds
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format
    const formattedHours = String(hours).padStart(2, "0");

    return `${year}-${month}-${day} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

export const logger = {
    /**
     * Logs an info message.
     * @param {String|Object} message - The message to log.
     */
    info: (message) => {
        const logMessage = `\n[INFO] [${getDateTime()}] \n${formatMessage(message)}`;
        console.log(chalk.blue(logMessage));
        writeLogToFile(logMessage);
    },
    /**
     * Logs a debug message.
     * @param {String|Object} message - The message to log.
     */
    debug: (message) => {
        const logMessage = `\n[DEBUG] [${getDateTime()}] \n${formatMessage(message)}`;
        console.log(chalk.green(logMessage));
        writeLogToFile(logMessage);
    },
    /**
     * Logs a warning message.
     * @param {String|Object} message - The message to log.
     */
    warn: (message) => {
        const logMessage = `\n[WARN] [${getDateTime()}] \n${formatMessage(message)}`;
        console.warn(chalk.yellow(logMessage));
        writeLogToFile(logMessage);
    },
    /**
     * Logs an error message.
     * @param {String|Object} message - The message to log.
     */
    error: (message) => {
        const logMessage = `\n[ERROR] [${getDateTime()}] \n${formatMessage(message)}`;
        console.error(chalk.red(logMessage));
        writeLogToFile(logMessage);
    }
};
