const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	isAdmin: {
        type: Boolean,
        default: false,
    },
	refreshTokens: [{
        type: String,
    }],
	favoriteLists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FavoriteList',
    }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;