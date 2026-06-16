// Dorm2Dorm OTP Backend Server
// =============================
// Prerequisites:
// 1. You must install Node.js (https://nodejs.org)
// 2. Open terminal in this folder and run: npm init -y
// 3. Install packages: npm install express cors body-parser twilio
// 4. Sign up at https://www.twilio.com/ to get your free Account SID, Auth Token, and a Phone Number.
// 5. Replace the TWILIO placeholders below with your actual details!
// 6. Start the server: node otp_backend.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- TWILIO CONFIGURATION ---
// Replace these with your actual Twilio Account SID and Auth Token
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID'; 
const authToken = 'YOUR_TWILIO_AUTH_TOKEN'; 
const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER'; 

const client = new twilio(accountSid, authToken);

// Temporary memory store for OTPs (In production, use MongoDB/Redis)
const otpStore = {};

// 1. Route to Generate and Send OTP
app.post('/api/send-otp', async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.length < 10) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number' });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store it temporarily with the phone number as the key
    otpStore[mobileNumber] = otp;

    try {
        // Send SMS via Twilio
        await client.messages.create({
            body: `Your Dorm2Dorm login OTP is: ${otp}`,
            from: twilioPhoneNumber,
            // Twilio requires country codes. Assuming India (+91)
            to: `+91${mobileNumber}` 
        });

        console.log(`OTP ${otp} sent to ${mobileNumber}`);
        res.json({ success: true, message: 'OTP sent successfully!' });
    } catch (error) {
        console.error("Twilio Error:", error);
        res.status(500).json({ success: false, message: 'Failed to send SMS. Check your Twilio credentials.' });
    }
});

// 2. Route to Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { mobileNumber, otp } = req.body;

    if (otpStore[mobileNumber] && otpStore[mobileNumber] === otp) {
        // OTP is correct
        delete otpStore[mobileNumber]; // Clear OTP after use
        res.json({ success: true, message: 'OTP Verified successfully!' });
    } else {
        // OTP is incorrect
        res.status(400).json({ success: false, message: 'Invalid OTP or expired.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Dorm2Dorm OTP Backend running on http://localhost:${PORT}`);
    console.log(`👉 Remember to update your Twilio credentials in the code to send real SMS!`);
});
