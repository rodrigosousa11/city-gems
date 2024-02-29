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
});

module.exports = mongoose.model("FavoriteList", favoriteListSchema);
