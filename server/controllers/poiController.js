const axios = require('axios');
const POI = require('../models/Poi');
const Review = require('../models/Review');

const createPoi = async (req, res) => {
    try {
        const { name, description, latitude, longitude, images } = req.body;

        const formattedLatitude = latitude.toString().replace(',', '.');
        const formattedLongitude = longitude.toString().replace(',', '.');

        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${formattedLatitude}&lon=${formattedLongitude}&format=json`);

        if (response.status !== 200 || !response.data.address) {
            throw new Error('Failed to fetch location data');
        }

        const { city, county } = response.data.address;
        const location = `${city}, ${county}`;

        const newPoi = new POI({
            name,
            description,
            latitude: formattedLatitude,
            longitude: formattedLongitude,
            location,
            images
        });

        await newPoi.save();

        console.log(response.data.address);
        res.status(201).json({ message: "POI created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create POI" });
    }
}

const getPoIs = async (req, res) => {
    try {
        const pois = await POI.find().populate({
            path: 'reviews',
            populate: { 
                path: 'user',
                select: 'firstName lastName'
            }
        });
        res.json(pois);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch POIs" });
    }
}

const getPoI = async (req, res) => {
    try {
        const { id } = req.params;

        const poi = await POI.findById(id).populate({
            path: 'reviews',
            populate: { 
                path: 'user',
                select: 'firstName lastName'
            }
        });

        if (!poi) {
            return res.status(404).json({ message: "POI not found" });
        }

        res.json(poi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch POI" });
    }
}

const updatePoi = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, latitude, longitude } = req.body;

        const poi = await POI.findById(id);
        if (!poi) {
            return res.status(404).json({ message: "POI not found" });
        }

        poi.name = name;
        poi.description = description;
        poi.latitude = latitude;
        poi.longitude = longitude;

        await poi.save();

        res.json({ message: "POI updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update POI" });
    }
}

const deletePoi = async (req, res) => {
    try {
        const { id } = req.params;

        const poi = await POI.findById(id);
        if (!poi) {
            return res.status(404).json({ message: "POI not found" });
        }

        await POI.deleteOne({ _id: id });

        res.json({ message: "POI deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete POI" });
    }
};

const addReviewToPoi = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, rating } = req.body;
        const user = req.user;

        const poi = await POI.findById(id);
        if (!poi) {
            return res.status(404).json({ message: "POI not found" });
        }

        const newReview = new Review({
            user,
            comment,
            rating
        });

        await newReview.save();

        poi.reviews.push(newReview);
        poi.visits += 1;
        await poi.save();

        res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add review to POI" });
    }
}

const deleteReview = async (req, res) => {
    try {
        const { poiId, reviewId } = req.params;

        const poi = await POI.findById(poiId);
        if (!poi) {
            return res.status(404).json({ message: "POI not found" });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        poi.reviews.pull(reviewId);

        await poi.save();

        await Review.deleteOne({ _id: reviewId });

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete review" });
    }
}

module.exports = { 
    createPoi,
    getPoIs,
    getPoI,
    updatePoi,
    deletePoi,
    addReviewToPoi,
    deleteReview
};
