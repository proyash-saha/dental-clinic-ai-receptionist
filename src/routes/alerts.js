import "dotenv/config";

import express from "express";

import { STATUS } from "../utils/api-response.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.post("/emergency", async (req, res) => {
    logger.info(`[alerts.js] [POST /alerts/emergency] - Received request to send an emergency alert to clinic. \nRequest body: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const { callerName, callerPhoneNumber, emergencyDetails } = req.body;

        if (!callerName || !callerPhoneNumber || !emergencyDetails) {
            return res.status(STATUS.BAD_REQUEST).json({
                message: "Either email or phone number is required to send the appointment booking link."
            });
        }

        // Send emergency notification to clinic through email or SMS

        res.status(STATUS.OK).json({
            message: "Emergency alert sent to clinic."
        });
    } catch (error) {
        logger.error(`[alerts.js] [POST /alerts/emergency] - Error while trying to send an emergency alert to clinic. \nError: ${JSON.stringify(error, null, 2)}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error.",
            error: error.message
        });
    }
});

export { router };
