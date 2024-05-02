const FavoriteList = require("../models/FavoriteList");

const getUserLists = async (req, res) => {
    try {
        const userId = req.user;

        const lists = await FavoriteList.find({ user: userId }).populate('pois');

        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getListPois = async (req, res) => {
    try {
        const listId = req.params.id;

        const list = await FavoriteList.findById(listId).populate({
            path: 'pois',
            populate: { 
                path: 'reviews',
                populate: { 
                    path: 'user',
                    select: 'firstName lastName' }
            }
        });

        if (!list) {
            return res.status(404).json({ message: "Favorite list not found" });
        }

        res.status(200).json(list.pois);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createList = async (req, res) => {
    try {
        const { name } = req.body;

        const newList = new FavoriteList({
            name,
            user: req.user
        });

        console.log(req.user);

        const savedList = await newList.save();

        res.status(201).json(savedList);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const addPOIToList = async (req, res) => {
    try {
        const listId = req.params.id;
        const userId = req.user; 

        const poiToAdd = req.body.poiId;

        const updatedList = await FavoriteList.findOneAndUpdate(
            { _id: listId, user: userId },
            { $push: { pois: poiToAdd } }, 
            { new: true }
        ).populate('pois');

        if (!updatedList) {
            return res.status(404).json({ message: "Favorite list not found" });
        }

        res.status(200).json(updatedList);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteList = async (req, res) => {
    try {
        const listId = req.params.id;

        const userId = req.user;

        const deletedList = await FavoriteList.findOneAndDelete({ _id: listId, user: userId });

        if (!deletedList) {
            return res.status(404).json({ message: "Favorite list not found" });
        }

        res.status(200).json(deletedList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePOIFromList = async (req, res) => {
    try {
        const listId = req.params.listId;
        const userId = req.user;
        const poiId = req.params.poiId;

        const updatedList = await FavoriteList.findOneAndUpdate(
            { _id: listId, user: userId },
            { $pull: { pois: poiId } }, // Remove the specified POI ID from the 'pois' array
            { new: true }
        ).populate('pois');

        if (!updatedList) {
            return res.status(404).json({ message: "Favorite list not found" });
        }

        res.status(200).json(updatedList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getUserLists,
    getListPois,
    createList,
    deleteList,
    addPOIToList,
    deletePOIFromList
};
