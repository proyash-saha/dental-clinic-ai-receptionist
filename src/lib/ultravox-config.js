import "dotenv/config";

const TOOLS_BASE_URL = process.env.TOOLS_BASE_URL;

const SYSTEM_PROMPT = `
Your name is Deobra. You are a virtual, AI receptionist at ACME Dental Care, a local dental clinic.

Your responsibilities:
1. Greet all callers with a warm, professional, and natural-sounding tone.
2. Answer questions about clinic hours, services, and staff.
3. Handle dental emergencies with urgency. Use the "sendEmergencyNotification" tool to notify staff.
4. Verify existing patients by asking their phone number (must be a 10-digit number). Use the "lookupPatient" tool to check if they are in the system.
5. Offer appointment booking links for verified existing patients via email or SMS. Use the "sendAppointmentBookingLink" tool.
6. For new patients, take their name, phone number, and reason for the call and send a message to the clinic for a callback. Use the "takeMessage" tool..

# Clinic Info:
- Address: 456 Smile Lane, Winnipeg, MB R3C 2B4
- Hours: Mon-Fri: 8am-6pm, Sat: 9am-1pm, Sun: Closed

# Services:
- Routine Checkups
- Cleanings
- Fillings & Crowns
- Root Canals
- Cosmetic Dentistry
- Emergency Services

REMEMBER:
- If the clinic is currently closed, use the "closedGreeting".
- Otherwise, use the "openGreeting".
`;

const SELECTED_TOOLS = [
    {
        temporaryTool: {
            modelToolName: "lookupPatient",
            description: "Looks up existing patients.",
            dynamicParameters: [
                {
                    name: "phoneNumber",
                    location: "PARAMETER_LOCATION_QUERY",
                    schema: { type: "string", pattern: "^\\d{10}$" },
                    required: true
                }
            ],
            http: {
                baseUrlPattern: `${TOOLS_BASE_URL}/patients`,
                httpMethod: "GET"
            }
        }
    },
    {
        temporaryTool: {
            modelToolName: "createNewPatient",
            description: "Creates a new patient in the system.",
            dynamicParameters: [
                {
                    name: "phoneNumber",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string", pattern: "^\\d{10}$" },
                    required: true
                },
                {
                    name: "email",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                },
                {
                    name: "firstName",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                },
                {
                    name: "lastName",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                },
                {
                    name: "notes",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                }
            ],
            http: {
                baseUrlPattern: `${TOOLS_BASE_URL}/patients`,
                httpMethod: "POST"
            }
        }
    },
    {
        temporaryTool: {
            modelToolName: "sendAppointmentBookingLink",
            description: "Sends appointment booking link to existing patients.",
            dynamicParameters: [
                {
                    name: "email",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { description: "Patient's email", type: "string" }
                },
                {
                    name: "phoneNumber",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { description: "Patient's phone number", type: "string" }
                }
            ],
            http: {
                baseUrlPattern: `${TOOLS_BASE_URL}/appointments/send-link`,
                httpMethod: "POST"
            }
        }
    },
    {
        temporaryTool: {
            modelToolName: "sendEmergencyNotification",
            description: "Notifies staff of a dental emergency.",
            automaticParameters: [
                {
                    name: "callId",
                    location: "PARAMETER_LOCATION_BODY",
                    knownValue: "KNOWN_PARAM_CALL_ID"
                }
            ],
            dynamicParameters: [
                {
                    name: "callerName",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                },
                {
                    name: "callerPhoneNumber",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                },
                {
                    name: "emergencyDetails",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                }
            ],
            http: {
                baseUrlPattern: `${TOOLS_BASE_URL}/alerts/emergency`,
                httpMethod: "POST"
            }
        }
    }
];

export const ULTRAVOX_CALL_CONFIG = {
    systemPrompt: SYSTEM_PROMPT,
    model: "fixie-ai/ultravox",
    voice: "Deobra",
    temperature: 0.3,
    firstSpeaker: "FIRST_SPEAKER_AGENT",
    selectedTools: SELECTED_TOOLS,
    medium: { twilio: {} }
};
