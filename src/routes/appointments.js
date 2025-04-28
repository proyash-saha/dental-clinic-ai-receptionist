import "dotenv/config";

import express from "express";

import { STATUS } from "../utils/api-response.js";
import { logger } from "../utils/logger.js";
import { isValidEmail, isValidPhoneNumber } from "../utils/strings.js";

const router = express.Router();

router.post("/send-link", async (req, res) => {
    logger.info(`[appointments.js] [POST /appointments/send-link] - Received request to send the appointment booking link. \nRequest body: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const { email, phoneNumber } = req.body;

        if (!email && !phoneNumber) {
            logger.error("[appointments.js] [POST /appointments/send-link] - Neither email nor phone number was provided in the request body.");
            return res.status(STATUS.BAD_REQUEST).json({
                error: "Either email or phone number is required to send the appointment booking link."
            });
        }

        if (email && !isValidEmail(email)) {
            logger.error(`[appointments.js] [POST /appointments/send-link] - Missing or invalid email. email = ${email}`);
            return res.status(STATUS.BAD_REQUEST).json({
                error: "Missing or invalid email."
            });
        }

        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            logger.error(`[appointments.js] [POST /appointments/send-link] - Missing or invalid phone number. It must be a 10-digit number. phoneNumber = ${email}`);
            return res.status(STATUS.BAD_REQUEST).json({
                error: "Missing or invalid phone number. It must be a 10-digit number."
            });
        }

        // Send appointment booking link to patient through email or SMS

        res.status(STATUS.OK).json({
            message: "Appointment booking link was sent to patient."
        });
    } catch (error) {
        logger.error(`[appointments.js] [POST /appointments/send-link] - Could not send the appointment booking link. \nError: ${error.message}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            error: error.message
        });
    }
});

export { router };
