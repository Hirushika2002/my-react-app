import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './user.js';
import Booking from './booking.js';
import Room from './room.js';

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

// Seed sample bookings for availability demo (runs once)
async function seedAvailability() {
    try {
        const existing = await Booking.findOne({ notes: /seed-availability-2025/ });
        if (existing) return;
        const seeds = [
            {
                guestName: 'Seed Guest A',
                roomNumber: '101',
                checkIn: new Date('2025-11-11'),
                checkOut: new Date('2025-11-15'),
                status: 'confirmed',
                notes: 'seed-availability-2025-hotel-1',
                hotelId: 1
            },
            {
                guestName: 'Seed Guest B',
                roomNumber: '202',
                checkIn: new Date('2025-11-11'),
                checkOut: new Date('2025-11-15'),
                status: 'confirmed',
                notes: 'seed-availability-2025-hotel-3',
                hotelId: 3
            }
        ];
        await Booking.insertMany(seeds);
        console.log('Seeded demo bookings for availability (Nov 11–15 2025)');
    } catch (e) {
        console.error('Failed to seed availability', e);
    }
}

// run seed after a short delay to ensure DB connection is ready
setTimeout(() => { seedAvailability(); }, 1500);

async function seedRooms() {
    try {
        const existing = await Room.findOne({ roomNumber: '101' });
        if (existing) return;
        const seedData = [
            {
                name: 'City View Deluxe',
                roomNumber: '101',
                type: 'Deluxe',
                price: 189,
                amenities: ['King bed', 'City skyline view', 'Fast Wi-Fi'],
                description: 'Spacious room overlooking the Colombo skyline with access to the executive lounge.',
                images: ['https://images.unsplash.com/photo-1501117716987-c8e1ecb21078?auto=format&fit=crop&w=1200&q=80'],
                capacity: 2
            },
            {
                name: 'Family Suite',
                roomNumber: '202',
                type: 'Suite',
                price: 249,
                amenities: ['Two queen beds', 'Kitchenette', 'Balcony'],
                description: 'Ideal for families with separate living space and on-demand in-room dining.',
                images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'],
                capacity: 4
            },
            {
                name: 'Garden Villa',
                roomNumber: 'V3',
                type: 'Villa',
                price: 325,
                amenities: ['Private plunge pool', 'Outdoor shower', 'Butler service'],
                description: 'Standalone villa surrounded by tropical gardens, perfect for honeymoons.',
                images: ['https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=1200&q=80'],
                capacity: 2
            }
        ];
        await Room.insertMany(seedData);
        console.log('Seeded default rooms');
    } catch (e) {
        console.error('Failed to seed rooms', e);
    }
}

setTimeout(() => { seedRooms(); }, 2000);

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
app.get(base, async (req, res) => {
    try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.hotelId) filter.hotelId = req.query.hotelId;
    const list = await Booking.find(filter).sort({ createdAt: -1 });
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

// Room management endpoints
const roomsBase = '/api/rooms';

app.get(roomsBase, async (_req, res) => {
    try {
        const rooms = await Room.find().sort({ price: 1 });
        res.json(rooms);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Failed to load rooms' });
    }
});

app.post(roomsBase, async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Invalid room data' });
    }
});

app.put(`${roomsBase}/:id`, async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).json({ message: 'Not found' });
        res.json(room);
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Invalid room data' });
    }
});

app.delete(`${roomsBase}/:id`, async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Invalid id' });
    }
});
