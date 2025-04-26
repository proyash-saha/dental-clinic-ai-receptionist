import "dotenv/config";
import https from "node:https";

const ULTRAVOX_API_KEY = process.env.ULTRAVOX_API_KEY;
const ULTRAVOX_API_URL = "https://api.ultravox.ai/api";

export async function createUltravoxCall(callConfig) {
    const request = https.request(`${ULTRAVOX_API_URL}/calls`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": ULTRAVOX_API_KEY
        }
    });

    return new Promise((resolve, reject) => {
        let data = "";

        request.on("response", (response) => {
            response.on("data", (chunk) => (data += chunk));
            response.on("end", () => resolve(JSON.parse(data)));
        });

        request.on("error", reject);
        request.write(JSON.stringify(callConfig));
        request.end();
    });
}
