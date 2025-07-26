import express from "express";
import { addEvent, getEvents, getEventsByIds } from "../controllers/eventController.js";
import { protectAdmin } from "../middleware/auth.js";

const eventRouter = express.Router();

eventRouter.post("/add", protectAdmin, addEvent);
eventRouter.get("/all", getEvents);
eventRouter.get("/by-ids", getEventsByIds);

export default eventRouter;
