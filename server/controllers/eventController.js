import Event from "../models/Event.js";

// Add a new event
export const addEvent = async (req, res) => {
    try {
        const { name, date, photo, organizer, description, kind } = req.body;
        const event = await Event.create({ name, date, photo, organizer, description, kind });
        res.json({ success: true, event });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all events
export const getEvents = async (req, res) => {
    try {
        // Remove date filter to fetch all events
        const events = await Event.find({});
        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get events by IDs (comma-separated)
export const getEventsByIds = async (req, res) => {
    try {
        const ids = req.query.ids
            ? req.query.ids.split(',').filter(Boolean)
            : [];
        if (!ids.length) {
            return res.json({ success: false, message: "No event ids provided", events: [] });
        }
        const events = await Event.find({ _id: { $in: ids } });
        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message, events: [] });
    }
};
