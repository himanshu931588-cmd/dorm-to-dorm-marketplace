// Prerequisites: 
// 1. Install Node.js from https://nodejs.org/
// 2. Open terminal in this folder and run: npm init -y
// 3. Run: npm install express mongoose cors
// 4. Run: node backend_server_code.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/dorm2dorm', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected to Dorm2Dorm Database'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Create Item Schema
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    sellerEmail: { type: String, default: 'himanshu931588@gmail.com' },
    createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// API Routes

// GET all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// POST a new item (Sell Item)
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item({
            name: req.body.name,
            price: req.body.price,
            image: req.body.image
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ error: 'Failed to list item' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
