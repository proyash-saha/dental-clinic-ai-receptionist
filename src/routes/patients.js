import "dotenv/config";

import express from "express";

import { STATUS } from "../utils/api-response.js";
import { getCurrentDateTimeInUTC } from "../utils/date-time.js";
import { logger } from "../utils/logger.js";
import { REQUIRED_PATIENT_FIELDS, isValidPhoneNumber } from "../utils/strings.js";

const router = express.Router();

router.get("/", async (req, res) => {
    logger.info(`[patients.js] [GET /patients] - Received request to get patient by phone number. \nRequest query: ${JSON.stringify(req.query, null, 2)}`);

    try {
        const db = req.app.locals.db;
        const { phoneNumber } = req.query;

        if (!isValidPhoneNumber(phoneNumber)) {
            logger.error(`[patients.js] [GET /patients] - Missing or invalid phone number. It must be a 10-digit number. phoneNumber = ${phoneNumber}.`);
            return res.status(STATUS.BAD_REQUEST).json({
                error: "Missing or invalid phone number. It must be a 10-digit number."
            });
        }

        const patient = await db.getPatientByPhoneNumber(phoneNumber);

        if (!patient || typeof patient !== "object" || Object.keys(patient).length === 0) {
            logger.error(`[patients.js] [GET /patients] - Patient not found for phone number: ${phoneNumber}.`);
            return res.status(STATUS.NOT_FOUND).json({
                error: "Patient not found."
            });
        }

        res.status(STATUS.OK).json({
            message: "Patient found.",
            patient
        });
    } catch (error) {
        logger.error(`[patients.js] [GET /patients] - Could not retrieve patient. \nError: ${error.message}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    logger.info(`[patients.js] [POST /patients] - Received request to create a new patient from database. \nRequest body: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const db = req.app.locals.db;
        const patientInfo = req.body;

        patientInfo.initialCallbackComplete = false;
        patientInfo.createdAt = getCurrentDateTimeInUTC();
        patientInfo.modifiedAt = getCurrentDateTimeInUTC();

        const missingInfo = REQUIRED_PATIENT_FIELDS.filter((field) => patientInfo[field] === undefined);
        if (missingInfo.length > 0) {
            logger.error(`[patients.js] [POST /patients] - Missing required info for new patient: ${missingInfo.join(", ")}`);
            return res.status(STATUS.BAD_REQUEST).json({
                error: `Missing required info for new patient: ${missingInfo.join(", ")}`
            });
        }

        await db.addPatient(patientInfo);

        // Notify the clinic for "new patient callback"
        // We could put the patient info in a message queue that:
        //  - Sends an email to the clinic
        //  - Sends a text message to the clinic
        //  - Sends a message to the clinic's internal system through a webhook

        res.status(STATUS.OK).json({
            message: "Patient created in database."
        });
    } catch (error) {
        logger.error(`[patients.js] [POST /patients] - Could not create a new patient in database. \nError: ${error.message}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            error: error.message
        });
    }
});

export { router };
