import "dotenv/config";

import express from "express";

import { STATUS } from "../utils/api-response";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.post("/send-link", async (req, res) => {
    logger.info(`[appointments.js] [POST /appointments/send-link] - Received request to send the appointment booking link. \nRequest body: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const { email, phoneNumber } = req.body;

        if (!email || !phoneNumber) {
            logger.error("[appointments.js] [POST /appointments/send-link] - Neither email nor phone number was provided in the request body.");
            return res.status(STATUS.BAD_REQUEST).json({
                message: "Either email or phone number is required to send the appointment booking link."
            });
        }

        // Send appointment booking link to patient

        res.status(STATUS.OK).json({
            message: "Appointment booking link was sent to patient."
        });
    } catch (error) {
        logger.error(`[appointments.js] [POST /appointments/send-link] - Error while trying to send the appointment booking link. \nError: ${JSON.stringify(error, null, 2)}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error.",
            error: error.message
        });
    }
});

export { router };
