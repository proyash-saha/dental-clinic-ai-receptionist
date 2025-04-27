import "dotenv/config";

import express from "express";

import { router as alertsRoutes } from "./routes/alerts.js";
import { router as appointmentsRoutes } from "./routes/appointments.js";
import { router as patientsRoutes } from "./routes/patients.js";
import { router as twilioRoutes } from "./routes/twilio.js";

import { PatientsDB } from "./database/patients-db.js";

const port = 3000;
const app = express();

const db = new PatientsDB();
app.locals.db = db;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Dental clinic AI receptionist agent is live!");
});

app.listen(port, () => {
    console.log(`Application is listening on port ${port}`);
});

app.use("/twilio", twilioRoutes);

app.use("/patients", patientsRoutes);

app.use("/appointments", appointmentsRoutes);

app.use("/alerts", alertsRoutes);
