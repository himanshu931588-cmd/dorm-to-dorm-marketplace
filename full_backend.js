// Dorm2Dorm Ultimate Production Backend
// =====================================
// This is your complete, secure, production-ready backend server.
// It handles Authentication, Marketplace Items, and the Gamified Leaderboard.
//
// Prerequisites:
// 1. Install Node.js
// 2. Open terminal in this folder and run: npm init -y
// 3. Run: npm install express mongoose cors bcryptjs jsonwebtoken dotenv
// 4. Run: node full_backend.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const JWT_SECRET = 'dorm2dorm_ultimate_secure_key_2026';
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/dorm2dorm_production', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Ultimate MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// --- DATABASE SCHEMAS ---

// 1. User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '🦊' },
    wing: { type: String, required: true },
    referralCode: { type: String, unique: true },
    bonusPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// 2. Item Schema
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: { type: String },
    sellerMobile: { type: String },
    sellerAvatar: { type: String },
    sellerWing: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);


// --- MIDDLEWARE ---
// Verify JWT Token for protected routes
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ error: 'Access Denied. Please Login.' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token.' });
    }
};


// --- API ROUTES : AUTHENTICATION ---

// 1. Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, mobile, password, avatar, wing, usedReferralCode } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) return res.status(400).json({ error: 'User already exists.' });

        // Hash Password
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

        const newUser = new User({
            name, email, mobile, password: hashedPassword, avatar, wing, referralCode
        });
        await newUser.save();

        res.status(201).json({ message: 'Signup successful!', referralCode });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const user = await User.findOne({ mobile });
        if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Invalid credentials.' });

        // Create Token
        const token = jwt.sign({ _id: user._id, mobile: user.mobile, name: user.name, wing: user.wing, avatar: user.avatar, email: user.email }, JWT_SECRET);
        res.header('auth-token', token).json({ 
            token, 
            user: { _id: user._id, name: user.name, mobile: user.mobile, email: user.email, wing: user.wing, avatar: user.avatar, referralCode: user.referralCode } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- API ROUTES : MARKETPLACE ITEMS ---

// 1. Get All Items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Post New Item (Protected)
app.post('/api/items', verifyToken, async (req, res) => {
    try {
        const { name, price, image, category, condition } = req.body;
        
        const newItem = new Item({
            name, price, image, category, condition,
            sellerId: req.user._id,
            sellerName: req.user.name,
            sellerMobile: req.user.mobile,
            sellerAvatar: req.user.avatar,
            sellerWing: req.user.wing
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Delete My Item (Protected)
app.delete('/api/items/:id', verifyToken, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        // Ensure the user trying to delete is the actual seller
        if (item.sellerId.toString() !== req.user._id) {
            return res.status(403).json({ error: 'Not authorized to delete this item.' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- API ROUTES : LEADERBOARD & GAMIFICATION ---

// 1. Get Wing Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await User.find();
        const items = await Item.find();

        let wingData = {};
        let userContributions = {};

        // Calculate User Base & Referral Points
        users.forEach(u => {
            userContributions[u._id.toString()] = {
                name: u.name,
                avatar: u.avatar,
                wing: u.wing,
                points: 50 + (u.bonusPoints || 0)
            };
        });

        // Add Item Listing Points
        items.forEach(item => {
            if (userContributions[item.sellerId.toString()]) {
                userContributions[item.sellerId.toString()].points += 20;
            }
        });

        // Aggregate by Wing
        Object.values(userContributions).forEach(user => {
            if (user.wing) {
                if (!wingData[user.wing]) wingData[user.wing] = { points: 0, topUser: null, maxUserPoints: -1 };
                wingData[user.wing].points += user.points;
                
                if (user.points > wingData[user.wing].maxUserPoints) {
                    wingData[user.wing].maxUserPoints = user.points;
                    wingData[user.wing].topUser = user;
                }
            }
        });

        // Sort Leaderboard
        const sortedWings = Object.keys(wingData).map(wing => ({
            name: wing,
            points: wingData[wing].points,
            topUser: wingData[wing].topUser
        })).sort((a, b) => b.points - a.points);

        res.json(sortedWings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Ultimate Campus Backend running on http://localhost:${PORT}`);
});
