// Dorm2Dorm Strong Authentication Backend
// =====================================
// This is your production-ready, secure backend server.
// Prerequisites:
// 1. Install Node.js
// 2. Run: npm install express mongoose cors bcrypt jsonwebtoken
// 3. Run: node auth_backend.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const JWT_SECRET = 'your_super_secret_jwt_key_dorm2dorm_2026'; // Change this in production!

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/dorm2dorm_secure')
  .then(() => console.log('✅ Secure MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Will store hashed password
    avatar: { type: String, default: '🦊' },
    wing: { type: String },
    room: { type: String },
    referralCode: { type: String },
    usedReferralCode: { type: String },
    bonusPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- API ROUTES ---

// 1. User Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, mobile, password, avatar, wing, room, usedReferralCode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or mobile already exists.' });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Referral Code
        const referralCode = name.substring(0,3).toUpperCase().replace(/[^A-Z]/g, 'X') + Math.floor(1000 + Math.random() * 9000);

        // Process Used Referral Code (Give points to referrer)
        if (usedReferralCode) {
            const referrer = await User.findOne({ referralCode: usedReferralCode.toUpperCase() });
            if (referrer) {
                referrer.bonusPoints += 100;
                await referrer.save();
            }
        }

        // Save new user
        const newUser = new User({ name, email, mobile, password: hashedPassword, avatar, wing, room, referralCode, usedReferralCode });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully!', referralCode });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during signup.' });
    }
});

// 2. User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Find user by mobile number
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ error: 'Invalid mobile number or password.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid mobile number or password.' });
        }

        // Generate JWT Token for session management
        const token = jwt.sign({ id: user._id, name: user.name, mobile: user.mobile, avatar: user.avatar, wing: user.wing, room: user.room }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, wing: user.wing, room: user.room, referralCode: user.referralCode, bonusPoints: user.bonusPoints }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// 3. Get User Profile (Protected Route)
// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

app.get('/api/users/profile', verifyToken, async (req, res) => {
    try {
        // req.user.id comes from the verified JWT token
        const user = await User.findById(req.user.id).select('-password'); // Don't return the password
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Strong Auth Backend running on http://localhost:${PORT}`);
});
