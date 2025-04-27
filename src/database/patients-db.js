import { isValidPhoneNumber } from "../utils/strings.js";

import fs from "fs";

const REQUIRED_PATIENT_FIELDS = ["phoneNumber", "email", "firstName", "lastName", "createdAt", "modifiedAt"];

/**
 * A simple patient database that stores patient records in a JSON file.
 * Each patient is uniquely identified by their phone number.
 */
export class PatientsDB {
    /**
     * Creates a new PatientDB instance.
     * @param {String} [filePath="patients-db.json"] - Path to the JSON database file.
     */
    constructor(filePath = "src/database/patients.json") {
        this.filePath = filePath;
        this.initializeDatabase();
    }

    /**
     * Initializes the database file if it doesn't exist.
     *
     * @throws {Error} If database initialization fails.
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
     * Writes patients to the database file.
     * @param {Object[]} patients - Array of patient objects to write.
     *
     * @throws {Error} If writing to the file fails.
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
     * @returns {Promise<Object[]>} Array of patient objects.
     * @throws {Error} If reading from the file fails.
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
     * Retrieves a patient by their phone number.
     * @param {String} phoneNumber - The phone number to search patient by.
     *
     * @returns {Promise<Object|null>} The patient object if found, otherwise null.
     * @throws {Error} If an error occurs during the search.
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
     * @param {Object} patientInfo - The patient object to add.
     * @param {String} patientInfo.phoneNumber - The patient's phone number (required, unique).
     * @param {String} patientInfo.firstName - The patient's first name (required).
     * @param {String} patientInfo.lastName - The patient's last name (required).
     *
     * @returns {Promise<Object>} The added patient object.
     * @throws {Error} If required fields are missing or phone number already exists.
     */
    async addPatient(patientInfo) {
        try {
            if (!patientInfo || typeof patientInfo !== "object") {
                throw new Error(`Invalid patient info. It must be an object. patientInfo = ${patientInfo}`);
            }

            // Validate required fields
            const missingFields = REQUIRED_PATIENT_FIELDS.filter((field) => patientInfo[field] === undefined);
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields for new patient: ${missingFields.join(", ")}`);
            }

            // Check if patient already exists
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
     * @param {String} phoneNumber - The phone number of the patient to update.
     * @param {Object} patientInfo - The fields to update (cannot include phoneNumber).
     *
     * @returns {Promise<Object>} The updated patient object.
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

            // Don't allow changing phone number (used as ID)
            if (patientInfo.phoneNumber && patientInfo.phoneNumber !== phoneNumber) {
                throw new Error("Patient phone number cannot be updated.");
            }

            // Merge the updated info with the existing patient data
            patients[patientIndex] = { ...patients[patientIndex], ...patientInfo };
            await this.writePatients(patients);
            return patients[patientIndex];
        } catch (error) {
            throw new Error(`[patients-db.js] [updatePatient()] - Failed to update patient. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }

    /**
     * Deletes a patient from the database.
     * @param {String} phoneNumber - The phone number of the patient to delete.
     *
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
     * Searches for patients matching the given query.
     * @param {Object} query - The search criteria (e.g., { firstName: "John" }).
     *
     * @returns {Promise<Object[]>} Array of matching patient objects.
     * @throws {Error} If an error occurs during the search.
     */
    async searchPatients(query) {
        try {
            if (!query || typeof query !== "object") {
                throw new Error(`Invalid query. It must be an object. query = ${query}`);
            }

            const patients = await this.getAllPatients();
            return patients.filter((patient) => {
                return Object.keys(query).every((key) => {
                    // Case-insensitive partial match for string fields
                    if (typeof patient[key] === "string" && typeof query[key] === "string") {
                        return patient[key].toLowerCase().includes(query[key].toLowerCase());
                    }
                    // Exact match for other fields
                    return patient[key] === query[key];
                });
            });
        } catch (error) {
            throw new Error(`[patients-db.js] [searchPatients()] - Failed to search patient. Error: \n${JSON.stringify(error.message, null, 2)}`);
        }
    }
}
