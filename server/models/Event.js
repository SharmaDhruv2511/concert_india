import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    photo: { type: String, required: true },
    organizer: { type: String, required: true },
    description: { type: String },
    kind: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
