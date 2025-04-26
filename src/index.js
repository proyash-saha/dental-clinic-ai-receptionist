import "dotenv/config";

import express from "express";

import { router as twilioRoutes } from "./routes/twilio.js";

import { PatientsDB } from "./lib/patients-db.js";

const port = 3000;
const app = express();

const db = new PatientsDB();
app.locals.db = db;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/twilio", twilioRoutes);

app.get("/", (req, res) => {
    res.send("AI denatal receptionist agent is live!");
});

app.listen(port, () => {
    console.log(`Application is listening on port ${port}`);
});
