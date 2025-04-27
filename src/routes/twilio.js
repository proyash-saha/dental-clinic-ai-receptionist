import "dotenv/config";

import express from "express";
import twilio from "twilio";

import { ULTRAVOX_CALL_CONFIG } from "../lib/ultravox-config.js";
import { createUltravoxCall } from "../lib/ultravox.js";

import { logger } from "../utils/logger.js";

const router = express.Router();

router.post("/incoming", async (req, res) => {
    logger.info(`[twilio.js] [POST /twilio/incoming] - Received incoming call. \nRequest body: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const response = await createUltravoxCall(ULTRAVOX_CALL_CONFIG);

        const twiml = new twilio.twiml.VoiceResponse();
        const connect = twiml.connect();
        connect.stream({
            url: response.joinUrl,
            name: "ultravox"
        });

        res.type("text/xml");
        res.send(twiml.toString());
    } catch (error) {
        logger.error(`[twilio.js] [POST /twilio/incoming] - Error handling incoming call. \n${JSON.stringify(error, null, 2)}`);

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say("Sorry, there was an error connecting your call.");

        res.type("text/xml");
        res.send(twiml.toString());
    }
});

export { router };
