const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set, query, orderByChild, equalTo, get, remove } = require('firebase/database');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase
const firebaseConfig = {
    databaseURL: "https://ai-projects-d261b-default-rtdb.firebaseio.com/"
};
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyClNvwygY7QhdVUYfuKTzC5YBW2-o3Myp8');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// List of doctors with their specialties
const doctors = [
    { name: "Dr. Smith", specialty: "Cardiology", availableDays: ["Monday", "Wednesday", "Friday"] },
    { name: "Dr. Johnson", specialty: "Pediatrics", availableDays: ["Tuesday", "Thursday", "Saturday"] },
    { name: "Dr. Williams", specialty: "Dermatology", availableDays: ["Monday", "Tuesday", "Friday"] },
    { name: "Dr. Brown", specialty: "Neurology", availableDays: ["Wednesday", "Thursday", "Saturday"] },
    { name: "Dr. Davis", specialty: "Orthopedics", availableDays: ["Monday", "Wednesday", "Friday"] },
    { name: "Dr. Miller", specialty: "General Medicine", availableDays: ["Tuesday", "Thursday", "Saturday"] }
];

// Appointment session storage
const appointmentSessions = {};

// System prompt for Doctor Appointment Booking
const systemPrompt = `🔐 ROLE: You are an AI Doctor Appointment Booking Assistant. Your sole purpose is to:
1. Help users book doctor appointments
2. Guide them through the booking process
3. Handle appointment cancellations
4. Show available doctors randomly based on specialty

STRICT OPERATING PROTOCOLS:

1. APPOINTMENT BOOKING PHASE:
   - When a user asks to book an appointment, DO NOT show doctors immediately.
   - First ask:
     a. "What medical specialty do you need? (e.g. Cardiology, Pediatrics, Dermatology)"
     b. "What is your preferred appointment date? (Please provide in YYYY-MM-DD format)"
     c. "What is your preferred time slot? (Morning, Afternoon, Evening)"
   - Once all preferences are collected, show 3 available doctors matching the specialty.
   - Format each doctor clearly as:
     [Doctor Name] - [Specialty] - [Available Days]
     Example:
     1. Dr. Smith - Cardiology - Monday, Wednesday, Friday
     2. Dr. Johnson - Pediatrics - Tuesday, Thursday, Saturday
     3. Dr. Williams - Dermatology - Monday, Tuesday, Friday

2. BOOKING PROCESS (FOLLOW EXACT SEQUENCE):

   a. INITIATION:
      - Say: "Let's begin your appointment booking."

   b. COLLECT INFORMATION (ONE FIELD AT A TIME):
      Ask one question per message in this exact order:
      1. Full name
      2. Email address
      3. Phone number
      4. Date of birth (YYYY-MM-DD)
      5. Reason for visit (brief description)
      6. Insurance provider (if any)

   c. DOCTOR SELECTION:
      - Based on the user's specialty preference, show available doctors.
      - Say: "Here are available doctors for your specialty:"
      - Use the exact doctor format as above.

   d. FINAL CONFIRMATION:
      - After user selects a doctor, respond with EXACTLY:
        APPOINTMENT_CONFIRMED: {
          "patient_name": "[user name]",
          "email": "[user email]",
          "phone": "[user phone]",
          "dob": "[date of birth]",
          "doctor_name": "[selected doctor name]",
          "specialty": "[specialty]",
          "appointment_date": "[appointment date]",
          "time_slot": "[time slot]",
          "reason": "[reason for visit]",
          "insurance": "[insurance provider]",
          "appointment_id": "APT-[8 random alphanumeric chars]",
          "booking_date": "[current date YYYY-MM-DD]"
        }
      - Then say:
        "Your appointment has been booked! You'll receive a confirmation email."

3. CANCELLATION PROCESS (NON-NEGOTIABLE STEPS):
   1. Ask: "Please provide the email used for the booking."
   2. Show 2-3 appointments linked to that email:
      Found appointments:
      1. [Doctor Name] - [Appointment Date] - ID: APT-XXXXXX
      2. [Doctor Name] - [Appointment Date] - ID: APT-XXXXXX
   3. Ask: "Which appointment would you like to cancel? Please provide the Appointment ID."
   4. After ID is provided, respond with EXACTLY:
      CANCELLATION_REQUEST: {
        "email": "[user email]",
        "appointment_id": "[provided ID]"
      }
   5. Confirm:
      "Your appointment with [Doctor Name] on [Appointment Date] has been cancelled."

4. STRICT RULES:
   - NEVER suggest or guess appointment IDs
   - NEVER proceed without complete information
   - ALWAYS ask for specialty before showing doctors
   - ALWAYS show doctors randomly (shuffle the list before displaying)
   - ALWAYS use consistent ID format: APT-XXXXXX (6 alphanumeric)
   - NEVER combine questions - ask one at a time

5. TONE:
   - Professional but friendly
   - Concise responses
   - Use clear formatting for doctor listings
   - Show empathy during cancellations

EXAMPLE INTERACTION:

User: I want to book a doctor appointment

Assistant: I'd be happy to help you book an appointment.  
First, what medical specialty do you need? (e.g. Cardiology, Pediatrics, Dermatology)  
[User responds]  
What is your preferred appointment date? (Please provide in YYYY-MM-DD format)  
[User responds]  
What is your preferred time slot? (Morning, Afternoon, Evening)  
[User responds]  

Great! Here are available doctors for your specialty:
1. Dr. Smith - Cardiology - Monday, Wednesday, Friday  
2. Dr. Johnson - Pediatrics - Tuesday, Thursday, Saturday  
3. Dr. Williams - Dermatology - Monday, Tuesday, Friday  

Would you like to book an appointment with one of these doctors?
`;

// Function to shuffle doctors array for random display
function shuffleDoctors(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to filter doctors by specialty
function filterDoctorsBySpecialty(specialty) {
    return doctors.filter(doctor => 
        doctor.specialty.toLowerCase() === specialty.toLowerCase()
    );
}

async function sendGmail(toEmail, message) {
    // Create a transporter with connection pooling and timeout settings
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        pool: true, // use connection pooling
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'btechcodingwallah@gmail.com',
            pass: 'uxfs frot sarj ntiy'
        },
        tls: {
            rejectUnauthorized: false // for local testing only, remove in production
        },
        connectionTimeout: 10000, // 10 seconds
        socketTimeout: 30000, // 30 seconds
        greetingTimeout: 30000, // 30 seconds
        dnsTimeout: 10000 // 10 seconds
    });

    // Verify connection configuration
    try {
        await transporter.verify();
        console.log('Server is ready to take our messages');
    } catch (verifyError) {
        console.error('Error verifying transporter:', verifyError);
        return { success: false, error: 'Email service not available' };
    }

    const mailOptions = {
        from: 'Doctor Appointment System <btechcodingwallah@gmail.com>',
        to: toEmail,
        subject: 'Doctor Appointment Confirmation',
        text: message,
        html: message.includes('<!DOCTYPE html>') ? message : `<p>${message}</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);

        // Close the transporter connection pool
        transporter.close();

        // Handle specific error cases
        if (error.code === 'ECONNRESET') {
            return {
                success: false,
                error: 'Connection to email server was interrupted. Please try again later.'
            };
        }

        return {
            success: false,
            error: error.message || 'Failed to send email'
        };
    } finally {
        // Close the transporter connection pool after sending
        transporter.close();
    }
}

function createAppointmentEmailHTML(appointment) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 25px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 25px;
        }
        .appointment-details {
            background-color: #f5f7fa;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: 600;
            color: #555;
            width: 120px;
        }
        .detail-value {
            flex: 1;
        }
        .highlight {
            color: #4CAF50;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777;
            border-top: 1px solid #eee;
        }
        .appointment-id {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 10px;
            font-weight: bold;
        }
        .reminder {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Appointment is Confirmed! 🎉</h1>
        </div>
        
        <div class="content">
            <p>Dear <span class="highlight">${appointment.patient_name}</span>,</p>
            <p>Your appointment with <span class="highlight">${appointment.doctor_name}</span> has been successfully booked.</p>
            
            <div class="appointment-details">
                <h2 style="margin-top: 0; color: #4CAF50;">Appointment Details</h2>
                
                <div class="detail-row">
                    <div class="detail-label">Doctor:</div>
                    <div class="detail-value">${appointment.doctor_name} (${appointment.specialty})</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Date:</div>
                    <div class="detail-value">${appointment.appointment_date}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Time Slot:</div>
                    <div class="detail-value">${appointment.time_slot}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Reason:</div>
                    <div class="detail-value">${appointment.reason}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Insurance:</div>
                    <div class="detail-value">${appointment.insurance || 'Not specified'}</div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <div class="appointment-id">Appointment ID: ${appointment.appointment_id}</div>
                </div>
            </div>
            
            <div class="reminder">
                <p><strong>Important Reminder:</strong></p>
                <p>Please arrive 15 minutes before your scheduled appointment time.</p>
                <p>Bring your insurance card and a valid ID if applicable.</p>
            </div>
            
            <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
            
            <p>Best regards,<br>The Medical Appointment Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
            <p>© ${new Date().getFullYear()} Medical Appointment System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
}

function createCancellationEmailHTML(appointment) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Cancellation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #e74c3c;
            color: white;
            padding: 25px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 25px;
        }
        .appointment-details {
            background-color: #fef6f6;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #e74c3c;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: 600;
            color: #555;
            width: 120px;
        }
        .detail-value {
            flex: 1;
        }
        .highlight {
            color: #e74c3c;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777;
            border-top: 1px solid #eee;
        }
        .appointment-id {
            background-color: #e74c3c;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 10px;
            font-weight: bold;
        }
        .reschedule-message {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Appointment Has Been Cancelled</h1>
        </div>
        
        <div class="content">
            <p>Dear <span class="highlight">${appointment.patient_name}</span>,</p>
            <p>We're sorry to see you go. Your appointment with <span class="highlight">${appointment.doctor_name}</span> on ${appointment.appointment_date} has been successfully cancelled.</p>
            
            <div class="reschedule-message">
                We hope you'll consider scheduling another appointment in the future. If your plans change, we'd be happy to help you find a new appointment time.
            </div>
            
            <div class="appointment-details">
                <h2 style="margin-top: 0; color: #e74c3c;">Cancelled Appointment Details</h2>
                
                <div class="detail-row">
                    <div class="detail-label">Doctor:</div>
                    <div class="detail-value">${appointment.doctor_name} (${appointment.specialty})</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Date:</div>
                    <div class="detail-value">${appointment.appointment_date}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Time Slot:</div>
                    <div class="detail-value">${appointment.time_slot}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Reason:</div>
                    <div class="detail-value">${appointment.reason}</div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <div class="appointment-id">Cancelled Appointment ID: ${appointment.appointment_id}</div>
                </div>
            </div>
            
            <p>If this cancellation was made in error or you'd like to reschedule, please contact our office immediately.</p>
            
            <p>We hope to assist you with your healthcare needs in the future.</p>
            
            <p>Best regards,<br>The Medical Appointment Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
            <p>© ${new Date().getFullYear()} Medical Appointment System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
}

app.post('/api/doctor-appointment', async (req, res) => {
    try {
        const { query, sessionId } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Initialize or retrieve session
        const session = sessionId ? appointmentSessions[sessionId] : null;
        const currentSessionId = sessionId || `session-${Date.now()}`;

        // Prepare chat history
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! I'm your Doctor Appointment Booking assistant. Would you like help with booking an appointment or cancelling an existing one?" }]
                },
                ...(session?.history || [])
            ]
        });

        // Add current query to history
        if (session) {
            session.history.push({
                role: "user",
                parts: [{ text: query }]
            });
        }

        // Get response
        const result = await chat.sendMessage(query);
        const response = await result.response;
        let text = response.text();

        // Check for appointment confirmation
        const appointmentConfirmedRegex = /APPOINTMENT_CONFIRMED: (\{.*?\})/s;
        const appointmentMatch = text.match(appointmentConfirmedRegex);

        if (appointmentMatch) {
            try {
                const appointmentDetails = JSON.parse(appointmentMatch[1]);
                console.log(JSON.stringify(appointmentDetails));
                const sanitizedEmail = appointmentDetails.email.replace(/\./g, '_');
                const appointmentRef = ref(database, `Doctor_Appointment_System/appointment_details/${sanitizedEmail}`);
                const newAppointmentRef = push(appointmentRef);
                await set(newAppointmentRef, appointmentDetails);
                text = text.replace(appointmentConfirmedRegex, '');
                const htmlbodymsg = createAppointmentEmailHTML(appointmentDetails);
                await sendGmail(appointmentDetails.email, htmlbodymsg);
            } catch (error) {
                console.error('Error processing appointment:', error);
            }
        }

        // Check for cancellation request
        const cancellationRequestRegex = /CANCELLATION_REQUEST: (\{.*?\})/s;
        const cancellationMatch = text.match(cancellationRequestRegex);

        if (cancellationMatch) {
            try {
                const { email, appointment_id } = JSON.parse(cancellationMatch[1]);
                console.log(`${email} ${appointment_id}`);
                const sanitizedEmail = email.replace(/\./g, '_');

                // 1. Find the appointment to cancel
                const appointmentsRef = ref(database, `Doctor_Appointment_System/appointment_details/${sanitizedEmail}`);
                const snapshot = await get(appointmentsRef);

                let appointmentFound = false;
                let appointmentKey = null;
                let appointmentDetails = null;

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const appointment = childSnapshot.val();
                        if (appointment.appointment_id == appointment_id) {
                            appointmentKey = childSnapshot.key;
                            appointmentFound = true;
                            appointmentDetails = appointment;
                        }
                    });
                }

                if (!appointmentFound) {
                    text = text.replace(cancellationRequestRegex, '');
                    text += "\n\nSorry, we couldn't find the specified appointment to cancel. Please check your details and try again.";
                } else {
                    // 2. Simply delete the appointment - no cancellation record stored
                    const appointmentToDeleteRef = ref(database, `Doctor_Appointment_System/appointment_details/${sanitizedEmail}/${appointmentKey}`);
                    await remove(appointmentToDeleteRef);

                    // Update response message
                    text = text.replace(cancellationRequestRegex, '');
                    text += `\n\nYour appointment with ${appointmentDetails.doctor_name} on ${appointmentDetails.appointment_date} has been successfully cancelled.`;
                    text += "\nThe doctor's office has been notified of your cancellation.";

                    const msg = createCancellationEmailHTML(appointmentDetails);
                    await sendGmail(appointmentDetails.email, msg);
                }
            } catch (error) {
                console.error('Error processing cancellation:', error);
                text = text.replace(cancellationRequestRegex, '');
                text += "\n\nAn error occurred while processing your cancellation. Please try again later.";
            }
        }

        // Update session
        if (!appointmentSessions[currentSessionId]) {
            appointmentSessions[currentSessionId] = {
                history: [{
                    role: "user",
                    parts: [{ text: query }]
                }, {
                    role: "model",
                    parts: [{ text: text }]
                }]
            };
        } else {
            appointmentSessions[currentSessionId].history.push({
                role: "model",
                parts: [{ text: text }]
            });
        }

        res.json({
            response: text,
            sessionId: currentSessionId,
            isAppointmentInProgress: text.includes("appointment") || text.includes("book"),
            isCancellationInProgress: text.includes("cancel") || text.includes("cancellation")
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.delete('/api/cancel-appointment', async (req, res) => {
    try {
        const { userEmail, doctorName, appointmentDate } = req.body;

        if (!userEmail || !doctorName || !appointmentDate) {
            return res.status(400).json({ error: 'Email, doctor name, and appointment date are required' });
        }

        const sanitizedEmail = userEmail.replace(/\./g, '_');
        const appointmentsRef = ref(database, `Doctor_Appointment_System/appointment_details/${sanitizedEmail}`);

        // Find the appointment to cancel
        const snapshot = await get(appointmentsRef);
        let appointmentKey = null;

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const appointment = childSnapshot.val();
                if (appointment.doctor_name === doctorName && appointment.appointment_date === appointmentDate) {
                    appointmentKey = childSnapshot.key;
                }
            });
        }

        if (!appointmentKey) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Delete the appointment
        const appointmentToDeleteRef = ref(database, `Doctor_Appointment_System/appointment_details/${sanitizedEmail}/${appointmentKey}`);
        await remove(appointmentToDeleteRef);

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
            cancelledAppointment: { doctorName, appointmentDate }
        });

    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'An error occurred while cancelling the appointment' });
    }
});

function cleanupSessions() {
    const now = Date.now();
    const oneHour = 3600000;

    for (const [id, session] of Object.entries(appointmentSessions)) {
        const sessionTime = parseInt(id.split('-')[1]);
        if (now - sessionTime > oneHour) {
            delete appointmentSessions[id];
        }
    }
}

// Clean up sessions every hour
setInterval(cleanupSessions, 3600000);

app.listen(port, () => {
    console.log(`Doctor Appointment Booking System running on port ${port}`);
});