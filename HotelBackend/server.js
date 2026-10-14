require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Connect to local MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.log("MongoDB connection error:", err.message);
    });

// Booking schema
const bookingSchema = new mongoose.Schema({
    guest: {
        type: String,
        required: true,
        trim: true
    },
    room: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

// Get all bookings
app.get("/api/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ _id: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add booking
app.post("/api/bookings", async (req, res) => {
    try {
        const { guest, room, type } = req.body;

        if (!guest || !room || !type) {
            return res.status(400).json({
                error: "Please fill in all fields"
            });
        }

        const booking = await Booking.create({
            guest,
            room,
            type
        });

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update booking
app.put("/api/bookings/:id", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        res.json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete booking
app.delete("/api/bookings/:id", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
