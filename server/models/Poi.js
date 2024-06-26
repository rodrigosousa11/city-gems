const mongoose = require("mongoose");
const Review = require("../models/Review").default;

const poiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
        required: false,
    }],
    visits: {
        type: Number,
        default: 0,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
});

const Poi = mongoose.model("Poi", poiSchema);

module.exports = Poi;
