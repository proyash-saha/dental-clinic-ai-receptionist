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
            logger.error(`[patients.js] [GET /patients] - Missing or invalid format for phone number in request. Phone number: ${phoneNumber}.`);
            return res.status(STATUS.BAD_REQUEST).json({
                message: "Invalid phone number. It must be a 10-digit number."
            });
        }

        const patient = await db.getPatientByPhoneNumber(phoneNumber);

        if (!patient || typeof patient !== "object" || Object.keys(patient).length === 0) {
            logger.error(`[patients.js] [GET /patients] - Patient not found for phone number: ${phoneNumber}.`);
            return res.status(STATUS.NOT_FOUND).json({
                message: "Patient not found."
            });
        }

        res.status(STATUS.OK).json({
            message: "Patient found.",
            patient: {
                phoneNumber: patient.phoneNumber,
                email: patient.email,
                firstName: patient.firstName,
                lastName: patient.lastName
            }
        });
    } catch (error) {
        logger.error(`[patients.js] [GET /patients] - Error while trying to retrieve a patient. \nError: ${JSON.stringify(error, null, 2)}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error.",
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
            return res.status(STATUS.BAD_REQUEST).json({
                message: `Missing required info for new patient: ${missingInfo.join(", ")}`
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
        logger.error(`[patients.js] [POST /patients] - Error while trying to create a patient in database. \nError: ${JSON.stringify(error, null, 2)}`);
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error.",
            error: error.message
        });
    }
});

export { router };
