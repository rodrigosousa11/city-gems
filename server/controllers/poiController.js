const POI = require('../models/Poi');
const Review = require('../models/Review');

const createPoi = async (req, res) => {
    try {
        const { name, description, latitude, longitude, images } = req.body;

        const newPoi = new POI({
            name,
            description,
            latitude,
            longitude,
            images
        });

        await newPoi.save();

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

        poi.reviews.push(newReview); // Add the review to the POI's reviews array
        await poi.save();

        res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add review to POI" });
    }
}

module.exports = { 
    createPoi,
    getPoIs,
    getPoI,
    updatePoi,
    deletePoi,
    addReviewToPoi
};