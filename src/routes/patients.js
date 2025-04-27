import "dotenv/config";

import express from "express";

import { STATUS } from "../utils/api-response";
import { REQUIRED_PATIENT_FIELDS, isValidPhoneNumber } from "../utils/strings.js";

const router = express.Router();

router.get("/", async (req, res) => {
    console.info(`[patients.js] [GET /patients] - Received request to get patient by phone number. \nRequest query: ${JSON.stringify(req.query, null, 2)}`);

    try {
        const db = req.app.locals.db;
        const { phoneNumber } = req.query;

        if (!isValidPhoneNumber(phoneNumber)) {
            console.error(`[patients.js] [GET /patients] - Missing or invalid format for phone number in request. Phone number: ${phoneNumber}.`);
            return res.status(STATUS.BAD_REQUEST).json({
                message: "Invalid phone number. It must be a 10-digit number."
            });
        }

        const patient = await db.getPatientByPhoneNumber(phoneNumber);

        if (!patient || typeof patient !== "object" || Object.keys(patient).length === 0) {
            console.error(`[patients.js] [GET /patients] - Patient not found for phone number: ${phoneNumber}.`);
            return res.status(STATUS.NOT_FOUND).json({
                message: "Patient not found."
            });
        }

        res.status(STATUS.OK).json({
            message: "Patient found.",
            patient: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                phoneNumber: patient.phoneNumber,
                email: patient.email
            }
        });
    } catch (error) {
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error.",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    console.info(`[patients.js] [POST /patients] - Received request to create a new patient. \nRequest body: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const db = req.app.locals.db;
        const patientInfo = req.body;

        const missingInfo = REQUIRED_PATIENT_FIELDS.filter((field) => patientInfo[field] === undefined);
        if (missingInfo.length > 0) {
            return res.status(STATUS.BAD_REQUEST).json({
                message: `Missing required info for new patient: ${missingInfo.join(", ")}`
            });
        }

        await db.addPatient(patientInfo);

        res.status(STATUS.OK).json({
            message: "Patient created in database."
        });
    } catch (error) {
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error.",
            error: error.message
        });
    }
});

export { router };
