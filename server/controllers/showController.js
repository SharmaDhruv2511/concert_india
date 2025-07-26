import mongoose from "mongoose";
import Event from "../models/Event.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js"; // Add this import
import { inngest } from "../inngest/index.js";

// API to add a new show to the database (event only)
export const addShow = async (req, res) => {
    try {
        const { eventId, showsInput, showPrice } = req.body

        // Only allow event-based shows
        const event = await Event.findById(eventId);
        if (!event) {
            return res.json({ success: false, message: "Event not found." });
        }

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    event: eventId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });

        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        //  Trigger Inngest event
        await inngest.send({
            name: "app/show.added",
            data: { movieTitle: event.name }
        })

        res.json({ success: true, message: 'Show Added successfully.' })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to get all shows from the database (event only)
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('event').sort({ showDateTime: 1 });

        // filter unique shows by event
        const uniqueShows = new Set(shows.map(show => show.event))

        res.json({ success: true, shows: Array.from(uniqueShows) })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get a single show from the database (movie or event)
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(404).json({ success: false, message: "Invalid id." });
        }

        // Try to find as a Movie first
        const movie = await Movie.findById(movieId);
        if (movie) {
            // get all upcoming shows for the movie
            const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } });
            const dateTime = {};
            shows.forEach((show) => {
                const date = show.showDateTime.toISOString().split("T")[0];
                if (!dateTime[date]) {
                    dateTime[date] = [];
                }
                dateTime[date].push({ time: show.showDateTime, showId: show._id });
            });
            return res.json({ success: true, movie, dateTime });
        }

        // Try to find as an Event
        const event = await Event.findById(movieId);
        if (event) {
            // get all upcoming shows for the event
            const shows = await Show.find({ event: movieId, showDateTime: { $gte: new Date() } });
            const dateTime = {};
            shows.forEach((show) => {
                const date = show.showDateTime.toISOString().split("T")[0];
                if (!dateTime[date]) {
                    dateTime[date] = [];
                }
                dateTime[date].push({ time: show.showDateTime, showId: show._id });
            });
            return res.json({ success: true, event, dateTime });
        }

        // Not found
        return res.status(404).json({ success: false, message: "Show not found." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}