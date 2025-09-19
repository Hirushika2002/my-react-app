import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './user.js';
import Booking from './booking.js';

const app = express();
const port = 3000;

const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017/database';
mongoose.connect(mongoUrl).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch(err => {
    console.error('Connection error', err);
    process.exit();
});

app.use(cors());
app.use(express.json());

// Quick health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});


app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: 'Sign up successful', user});
    } catch (e) {
        if (e && (e.code === 11000 || e.name === 'MongoServerError')) {
            return res.status(409).json({ message: 'Username already taken' });
        }
        console.error(e);
        res.status(500).json({ message: 'Error signing up' });
    }
});


app.post('/api/signin', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ message: 'Sign in successful', user });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error signing in' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Bookings CRUD
const base = '/api/bookings';

// Create
app.post(base, async (req, res) => {
    try {
        const b = new Booking(req.body);
        await b.save();
        res.status(201).json(b);
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Invalid booking data' });
    }
});

// Read all
app.get(base, async (_req, res) => {
    try {
        const list = await Booking.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Failed to load bookings' });
    }
});

// Read one
app.get(`${base}/:id`, async (req, res) => {
    try {
        const b = await Booking.findById(req.params.id);
        if (!b) return res.status(404).json({ message: 'Not found' });
        res.json(b);
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Invalid id' });
    }
});

// Update
app.put(`${base}/:id`, async (req, res) => {
    try {
        const b = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!b) return res.status(404).json({ message: 'Not found' });
        res.json(b);
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Invalid data' });
    }
});

// Delete
app.delete(`${base}/:id`, async (req, res) => {
    try {
        const b = await Booking.findByIdAndDelete(req.params.id);
        if (!b) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Invalid id' });
    }
});
