import { REQUIRED_PATIENT_FIELDS, isValidPhoneNumber } from "../utils/strings.js";

import fs from "fs";

/**
 * A simple patient database that stores patient records in a JSON file.
 * Each patient is uniquely identified by their phone number.
 * Each patient record must include: phoneNumber, email, firstName, lastName, createdAt, and modifiedAt.
 */
export class PatientsDB {
    /**
     * @param {String} [filePath="src/database/patients.json"] - Path to the JSON database file.
     */
    constructor(filePath = "src/database/patients.json") {
        this.filePath = filePath;
        this.initializeDatabase();
    }

    /**
     * Initializes the database by creating the file if it doesn't exist.
     *
     * @throws {Error} If file creation fails.
     */
    initializeDatabase() {
        try {
            if (!fs.existsSync(this.filePath)) {
                fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
            }
        } catch (error) {
            throw new Error(`[patients-db.js] [initializeDatabase()] - Failed to initialize database. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }

    /**
     * Overwrites the database with a new array of patients.
     *
     * @param {Object[]} patients - Array of patient objects to store.
     *
     * @returns {Promise<void>}
     * @throws {Error} If writing fails.
     */
    async writePatients(patients) {
        try {
            if (!Array.isArray(patients)) {
                throw new Error(`Patients must be an array. patients = ${patients}`);
            }

            fs.writeFileSync(this.filePath, JSON.stringify(patients, null, 2));
        } catch (error) {
            throw new Error(`[patients-db.js] [writePatients()] - Failed to write patients to database. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }

    /**
     * Retrieves all patients from the database.
     *
     * @returns {Promise<Object[]>} List of all patient records.
     * @throws {Error} If reading fails.
     */
    async getAllPatients() {
        try {
            const data = fs.readFileSync(this.filePath, "utf8");
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`[patients-db.js] [getAllPatients()] - Failed to retrieve all patients from database. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }

    /**
     * Retrieves a patient by phone number.
     *
     * @param {String} phoneNumber - Patient's 10-digit phone number.
     *
     * @returns {Promise<Object|null>} The matching patient, or null if not found.
     * @throws {Error} If phone number is invalid or retrieval fails.
     */
    async getPatientByPhoneNumber(phoneNumber) {
        try {
            if (!isValidPhoneNumber(phoneNumber)) {
                throw new Error(`Invalid phone number. It must be a 10-digit number. phoneNumber = ${phoneNumber}`);
            }

            const patients = await this.getAllPatients();
            return patients.find((p) => p.phoneNumber === phoneNumber) || null;
        } catch (error) {
            throw new Error(
                `[patients-db.js] [getPatientByPhoneNumber()] - Failed to retrieve patient by phone number from database. Error: \n${JSON.stringify(error.message, null, 2)}`
            );
        }
    }

    /**
     * Adds a new patient to the database.
     *
     * @param {Object} patientInfo - Patient data.
     * @param {String} patientInfo.phoneNumber - Patient's phone number (unique).
     * @param {String} patientInfo.email - Patient's email.
     * @param {String} patientInfo.firstName - Patient's first name.
     * @param {String} patientInfo.lastName - Patient's last name.
     * @param {String} patientInfo.createdAt - ISO timestamp when the patient record was created.
     * @param {String} patientInfo.modifiedAt - ISO timestamp when the patient record was last modified.
     *
     * @returns {Promise<Object>} The newly added patient record.
     * @throws {Error} If required fields are missing or patient already exists.
     */
    async addPatient(patientInfo) {
        try {
            if (!patientInfo || typeof patientInfo !== "object") {
                throw new Error(`Invalid patient info. It must be an object. patientInfo = ${patientInfo}`);
            }

            const missingFields = REQUIRED_PATIENT_FIELDS.filter((field) => patientInfo[field] === undefined);
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields for new patient: ${missingFields.join(", ")}`);
            }

            const existingPatient = await this.getPatientByPhoneNumber(patientInfo.phoneNumber);
            if (existingPatient) {
                throw new Error(`Patient with phone number: ${patientInfo.phoneNumber} already exists.`);
            }

            const patients = await this.getAllPatients();
            patients.push(patientInfo);
            await this.writePatients(patients);

            return patientInfo;
        } catch (error) {
            throw new Error(`[patients-db.js] [addPatient()] - Failed to add a new patient. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }

    /**
     * Updates an existing patient's information.
     *
     * @param {String} phoneNumber - Patient's phone number.
     * @param {Object} patientInfo - Fields to update (cannot include phoneNumber).
     *
     * @returns {Promise<Object>} The updated patient record.
     * @throws {Error} If patient doesn't exist or trying to change phone number.
     */
    async updatePatient(phoneNumber, patientInfo) {
        try {
            if (!isValidPhoneNumber(phoneNumber)) {
                throw new Error(`Invalid phone number. It must be a 10-digit number. phoneNumber = ${phoneNumber}`);
            }

            if (!patientInfo || typeof patientInfo !== "object") {
                throw new Error(`Invalid patient info. It must be an object. patientInfo = ${patientInfo}`);
            }

            const patients = await this.getAllPatients();
            const patientIndex = patients.findIndex((p) => p.phoneNumber === phoneNumber);

            if (patientIndex === -1) {
                throw new Error(`Patient with phone number: ${phoneNumber} does not exist.`);
            }

            if (patientInfo.phoneNumber && patientInfo.phoneNumber !== phoneNumber) {
                throw new Error("Patient phone number cannot be updated.");
            }

            patients[patientIndex] = { ...patients[patientIndex], ...patientInfo };
            await this.writePatients(patients);

            return patients[patientIndex];
        } catch (error) {
            throw new Error(`[patients-db.js] [updatePatient()] - Failed to update patient. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }

    /**
     * Deletes a patient by phone number.
     *
     * @param {String} phoneNumber - Phone number of the patient to delete.
     *
     * @returns {Promise<void>}
     * @throws {Error} If patient doesn't exist.
     */
    async deletePatient(phoneNumber) {
        try {
            if (!isValidPhoneNumber(phoneNumber)) {
                throw new Error(`Invalid phone number. It must be a 10-digit number. phoneNumber = ${phoneNumber}`);
            }

            const patients = await this.getAllPatients();
            const filteredPatients = patients.filter((p) => p.phoneNumber !== phoneNumber);

            if (filteredPatients.length === patients.length) {
                throw new Error(`Patient with phone number: ${phoneNumber} does not exist.`);
            }

            await this.writePatients(filteredPatients);
        } catch (error) {
            throw new Error(`[patients-db.js] [deletePatient()] - Failed to delete patient. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }

    /**
     * Searches patients by given fields.
     *
     * @param {Object} query - Key-value pairs to match (supports partial match for strings).
     *
     * @returns {Promise<Object[]>} List of matching patients.
     * @throws {Error} If search fails.
     */
    async searchPatients(query) {
        try {
            if (!query || typeof query !== "object") {
                throw new Error(`Invalid query. It must be an object. query = ${query}`);
            }

            const patients = await this.getAllPatients();
            return patients.filter((patient) => {
                return Object.keys(query).every((key) => {
                    if (typeof patient[key] === "string" && typeof query[key] === "string") {
                        return patient[key].toLowerCase().includes(query[key].toLowerCase());
                    }
                    return patient[key] === query[key];
                });
            });
        } catch (error) {
            throw new Error(`[patients-db.js] [searchPatients()] - Failed to search patient. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }
}
