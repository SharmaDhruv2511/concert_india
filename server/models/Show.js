import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
    {
        movie: { type: String, ref: 'Movie' },
        event: { type: String, ref: 'Event' },
        showDateTime: { type: Date, required: true },
        showPrice: { type: Number, required: true },
        occupiedSeats: { type: Object, default: {} }
    },
    {
        minimize: false,
        // Custom validation: at least one of movie or event must be present
        validate: {
            validator: function () {
                return !!(this.movie || this.event);
            },
            message: "Either movie or event is required."
        }
    }
);

const Show = mongoose.model("Show", showSchema);

export default Show;