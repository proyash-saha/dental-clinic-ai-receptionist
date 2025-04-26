import "dotenv/config";

import express from "express";
import twilio from "twilio";

import { createUltravoxCall } from "../lib/ultravox.js";

import { ULTRAVOX_CALL_CONFIG } from "../utils/ultravox-config.js";

// Hack: Dictionary to store Twilio CallSid and Ultravox Call ID mapping
// In production you will want to replace this with something more durable
const activeCalls = new Map();

const router = express.Router();

router.post("/incoming", async (req, res) => {
    try {
        console.log("req.body = ", req.body);
        console.log("Incoming call received");

        const twilioCallSid = req.body.CallSid;
        console.log("Twilio CallSid = ", twilioCallSid);

        const response = await createUltravoxCall(ULTRAVOX_CALL_CONFIG);
        console.log("response = ", JSON.stringify(response, null, 2));

        activeCalls.set(response.callId, {
            twilioCallSid,
            type: "inbound"
        });

        const twiml = new twilio.twiml.VoiceResponse();
        console.log("twiml = ", twiml);
        const connect = twiml.connect();
        console.log("connect = ", connect);
        connect.stream({
            url: response.joinUrl,
            name: "ultravox"
        });

        res.type("text/xml");
        res.send(twiml.toString());
    } catch (error) {
        console.error("Error handling incoming call:", error);
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say("Sorry, there was an error connecting your call.");
        res.type("text/xml");
        res.send(twiml.toString());
    }
});

export { router };
