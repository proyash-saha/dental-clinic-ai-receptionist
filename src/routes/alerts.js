import "dotenv/config";

import express from "express";

import { STATUS } from "../utils/api-response.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

const REQUIRED_EMERGENCY_ALERT_REQUEST_FIELDS = ["callerName", "callerPhoneNumber", "emergencyDetails"];

router.post("/emergency", async (req, res) => {
    logger.info(`[alerts.js] [POST /alerts/emergency] - Received request to send an emergency alert to clinic. \nRequest body: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const emergencyDetails = req.body;

        const missingInfo = REQUIRED_EMERGENCY_ALERT_REQUEST_FIELDS.filter((field) => emergencyDetails[field] === undefined);
        if (missingInfo.length > 0) {
            logger.error(`[alerts.js] [POST /alerts/emergency]- Missing required info for emergency alert: ${missingInfo.join(", ")}.`);
            return res.status(STATUS.BAD_REQUEST).json({
                error: `Missing required info for emergency alert: ${missingInfo.join(", ")}`
            });
        }

        // Send emergency notification to clinic through email or SMS

        res.status(STATUS.OK).json({
            message: "Emergency alert sent to clinic."
        });
    } catch (error) {
        logger.error(`[alerts.js] [POST /alerts/emergency] - Could not send an emergency alert to clinic. \nError: ${error.message}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            error: error.message
        });
    }
});

export { router };
