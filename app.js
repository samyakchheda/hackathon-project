const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // To handle JSON requests

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://samyakchheda000:xWsnDwwMEKzIZ6Kn@cluster0.4ajiu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

// Define User schema and model
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    event_organized: Array,
});

const User = mongoose.model('User', UserSchema);

// Routes

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the API!" });
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ message: "User already exists!" });
    }

    const newUser = new User({ email, password, event_organized: [] });
    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: "Incorrect password!" });
    }

    res.status(200).json({ message: "Login successful!", email });
});

app.post('/add_event', async (req, res) => {
    const { email, event } = req.body;

    if (!event || typeof event !== 'object') {
        return res.status(400).json({ message: "Invalid event data!" });
    }

    await User.updateOne({ email }, { $push: { event_organized: event } });
    res.status(201).json({ message: "Event added successfully!" });
});

app.get('/get_events', async (req, res) => {
    const { email } = req.query;
    const user = await User.findOne({ email }, { event_organized: 1 });

    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ event_organized: user.event_organized });
});

module.exports = app;
