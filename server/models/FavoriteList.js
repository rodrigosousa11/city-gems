const mongoose = require("mongoose");

const favoriteListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    pois: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poi',
    }],
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


module.exports = mongoose.model("FavoriteList", favoriteListSchema);
