import "dotenv/config";

const TOOLS_BASE_URL = process.env.TOOLS_BASE_URL;

const SYSTEM_PROMPT = `
Your name is Deobra. You are a virtual, AI receptionist at Royal Dental Care, a local dental clinic.

Your responsibilities:
1. Greet all callers with a warm, professional, and natural-sounding tone.
2. Answer questions about clinic hours, services, and staff.
3. Handle dental emergencies with urgency by taking the caller's phone number, name and emergency details. Use the "sendEmergencyNotification" tool to notify staff.
4. Verify existing patients by asking their phone number (must be a 10-digit number). Use the "lookupPatient" tool to check if they exist in the system.
5. Offer appointment booking links for verified existing patients via email or SMS.Use the phone number or email from the patient info returned from system
    and ask the patient which mode of appointment booking link delivery would they like. Use the "sendAppointmentBookingLink" tool.
6. For new patients, always ask their phone number, email, first name, last name and use the "createNewPatientInSystem" tool.
    After a successful creation, let them know that they have been added to the system and will receive a call back shortly from someone at the clinic to book an 
    appointment or answer any other questions directly.

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

# Staff:
- Dr. John Smith (Dentist): Specializes in cosmetic dentistry and root canals.
- Dr. Emily Brown (Dentist): Expert in routine checkups and fillings.
- Sarah Johnson (Hygienist): Focuses on cleanings and patient education.
- Michael Lee (Receptionist): Handles scheduling and patient inquiries.

REMEMBER:
- Always ask the caller phone number in the beginning of the call to verify if they are an existing patient.
- Always convert error messages into friendly and professional responses. The error messages are returned as JSON objects. 
    Example: { "error": "Missing required info for new patient: phoneNumber, email" }.
- Start with appropriate greeting and let the caller know about the hours of operation.
- Use a friendly and professional tone.
- Use seperate greeting messages for "clinic is open" and "clinic is closed" scenarios.
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
            modelToolName: "createNewPatientInSystem",
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
                    schema: { description: "Patient's email to send appointment booking link", type: "string" }
                },
                {
                    name: "phoneNumber",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { description: "Patient's phone number to send appointment booking link as SMS", type: "string" }
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
            dynamicParameters: [
                {
                    name: "callerPhoneNumber",
                    location: "PARAMETER_LOCATION_BODY",
                    schema: { type: "string" },
                    required: true
                },
                {
                    name: "callerName",
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
