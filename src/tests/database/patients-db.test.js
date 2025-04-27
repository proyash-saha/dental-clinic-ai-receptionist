import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import { PatientsDB } from "../../database/patients-db.js";
import fs from "fs";

const TEST_DB_FILE_PATH = "src/tests/database/test-patients.json";

const mockPatient = {
    phoneNumber: "1234567890",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2023-10-01T12:00:00Z",
    modifiedAt: "2023-10-01T12:00:00Z"
};

describe("PatientsDB", () => {
    let db;

    beforeEach(() => {
        if (fs.existsSync(TEST_DB_FILE_PATH)) {
            fs.unlinkSync(TEST_DB_FILE_PATH);
        }
        db = new PatientsDB(TEST_DB_FILE_PATH);
    });

    afterEach(() => {
        if (fs.existsSync(TEST_DB_FILE_PATH)) {
            fs.unlinkSync(TEST_DB_FILE_PATH);
        }
    });

    describe("initializeDatabase()", () => {
        it("should not create a new patient database file when it already exists", () => {
            expect(fs.existsSync(TEST_DB_FILE_PATH)).toBe(true);
        });

        it("should create a new patient database file when it does not exist", () => {
            if (fs.existsSync(TEST_DB_FILE_PATH)) {
                fs.unlinkSync(TEST_DB_FILE_PATH);
            }
            expect(fs.existsSync(TEST_DB_FILE_PATH)).toBe(false);
            db = new PatientsDB(TEST_DB_FILE_PATH);
            expect(fs.existsSync(TEST_DB_FILE_PATH)).toBe(true);
        });

        it("should throw an error when database initialization fails", () => {
            const invalidPath = "/this/path/does/not/exist/test.json";
            try {
                db = new PatientsDB(invalidPath);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Failed to initialize database.");
            }
        });
    });

    describe("getAllPatients()", () => {
        it("should return an empty array when no patients are present", async () => {
            const patients = await db.getAllPatients();
            expect(patients).toEqual([]);
        });

        it("should return all patients if present", async () => {
            await db.addPatient(mockPatient);
            const patients = await db.getAllPatients();
            expect(patients).toEqual([mockPatient]);
        });

        it("should throw an error when retrieving all patients fails", async () => {
            // Simulate a failure by writing invalid JSON to the file
            fs.writeFileSync(TEST_DB_FILE_PATH, "broken json");

            try {
                await db.getAllPatients();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Failed to retrieve all patients from database.");
            }
        });
    });

    describe("getPatientByPhoneNumber()", () => {
        it("should return a patient when patient with phone number exists", async () => {
            await db.addPatient(mockPatient);
            const patient = await db.getPatientByPhoneNumber("1234567890");
            expect(patient).toEqual(mockPatient);
        });

        it("should return null when patient with phone number does not exist", async () => {
            const patient = await db.getPatientByPhoneNumber("0000000000");
            expect(patient).toBeNull();
        });

        it("should throw an error when phoneNumber is invalid", async () => {
            try {
                await db.getPatientByPhoneNumber("1234");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Invalid phone number. It must be a 10-digit number.");
            }
        });

        it("should throw an error when retrieving patient by phone number fails", async () => {
            // Simulate a failure by writing invalid JSON to the file
            fs.writeFileSync(TEST_DB_FILE_PATH, "broken json");

            try {
                await db.getPatientByPhoneNumber("1234567890");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Failed to retrieve patient by phone number from database.");
            }
        });
    });

    describe("addPatient()", () => {
        it("should add a new patient to the database", async () => {
            const patientsBefore = await db.getAllPatients();
            expect(patientsBefore).toEqual([]);
            await db.addPatient(mockPatient);
            const patientsAfter = await db.getAllPatients();
            expect(patientsAfter).toEqual([mockPatient]);
        });

        it("should throw an error when patientInfo is not an object", async () => {
            try {
                const patientInfo = "not an object";
                await db.addPatient(patientInfo);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Invalid patient info. It must be an object.");
            }
        });

        it("should throw an error when required fields are missing", async () => {
            try {
                const incompletePatientInfo = { ...mockPatient };
                delete incompletePatientInfo.firstName;
                delete incompletePatientInfo.lastName;
                await db.addPatient(incompletePatientInfo);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Missing required fields for new patient: firstName, lastName");
            }
        });

        it("should throw an error when patient with phone number already exists", async () => {
            try {
                await db.addPatient(mockPatient);
                await db.addPatient(mockPatient);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Patient with phone number: 1234567890 already exists.");
            }
        });
    });

    describe("updatePatient()", () => {
        it("should update a patient when they exist in database", async () => {
            await db.addPatient(mockPatient);
            const patientsBefore = await db.getAllPatients();
            expect(patientsBefore).toEqual([mockPatient]);

            const updatedPatientInfo = { firstName: "Jane" };
            await db.updatePatient(mockPatient.phoneNumber, updatedPatientInfo);
            const patientsAfter = await db.getAllPatients();
            expect(patientsAfter).toEqual([{ ...mockPatient, ...updatedPatientInfo }]);
        });

        it("should throw an error when patient to be updated does not exist in database", async () => {
            try {
                await db.addPatient(mockPatient);
                const updatedPatientInfo = { firstName: "Jane" };
                await db.updatePatient("0000000000", updatedPatientInfo);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Patient with phone number: 0000000000 does not exist.");
            }
        });

        it("should throw an error when phoneNumber is invalid", async () => {
            try {
                await db.addPatient(mockPatient);
                const updatedPatientInfo = { firstName: "Jane" };
                await db.updatePatient("1234", updatedPatientInfo);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Invalid phone number. It must be a 10-digit number.");
            }
        });

        it("should throw an error when patientInfo is not an object", async () => {
            try {
                await db.addPatient(mockPatient);
                const updatedPatientInfo = "not an object";
                await db.updatePatient("1234567890", updatedPatientInfo);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Invalid patient info. It must be an object.");
            }
        });

        it("should throw an error when patient to be updated does not exist in database", async () => {
            try {
                await db.addPatient(mockPatient);
                const updatedPatientInfo = { phoneNumber: "1111111111" };
                await db.updatePatient(mockPatient.phoneNumber, updatedPatientInfo);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Patient phone number cannot be updated.");
            }
        });
    });

    describe("deletePatient()", () => {
        it("should delete a patient when they exist in database", async () => {
            await db.addPatient(mockPatient);
            const patientsBefore = await db.getAllPatients();
            expect(patientsBefore).toEqual([mockPatient]);

            await db.deletePatient(mockPatient.phoneNumber);
            const patientsAfter = await db.getAllPatients();
            expect(patientsAfter).toEqual([]);
        });

        it("should throw an error when phoneNumber is invalid", async () => {
            try {
                await db.addPatient(mockPatient);
                await db.deletePatient("1234");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Invalid phone number. It must be a 10-digit number.");
            }
        });

        it("should throw an error when patient to be deleted does not exist in database", async () => {
            try {
                await db.addPatient(mockPatient);
                await db.deletePatient("0000000000");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Patient with phone number: 0000000000 does not exist.");
            }
        });
    });

    describe("searchPatients()", () => {
        it("should return matching patients for string fields", async () => {
            await db.addPatient(mockPatient);
            const result = await db.searchPatients({ firstName: "jo" });
            expect(result.length).toBe(1);
            expect(result[0].firstName).toBe("John");
        });

        it("should return an empty array if no match is found", async () => {
            const result = await db.searchPatients({ lastName: "invalidLastName" });
            expect(result).toEqual([]);
        });

        it("should return an empty array when search is done on a field that does not exist in the database for a patient", async () => {
            await db.addPatient(mockPatient);
            const result = await db.searchPatients({ age: 30 });
            expect(result.length).toBe(0);
        });

        it("should throw an error when patientInfo is not an object", async () => {
            try {
                await db.addPatient(mockPatient);
                await db.searchPatients("not an object");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("Invalid query. It must be an object.");
            }
        });
    });
});
