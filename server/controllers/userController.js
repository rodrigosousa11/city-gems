const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

let refreshTokens = [];

const registerUser = async (req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({
			firstName,
			lastName,
			email,
			password: hashedPassword,
		});
		await newUser.save();

		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Registration failed" });
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid password" });
		}

		const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: "30m",
		});
		const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET);
		
		refreshTokens.push(refreshToken);
		res.json({ accessToken: accessToken, refreshToken });
	} catch (error) {
		res.status(500).json({ message: "Login failed" });
	}
};

const getLoggedInUserDetails = async (req, res) => {
	try {
		const userId = req.user;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ firstName: user.firstName, lastName: user.lastName });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Failed to fetch user details" });
	}
};


const refreshToken = (req, res) => {
	const refreshToken = req.body.token;
	if (!refreshToken) {
		return res.status(401).json({ message: "Missing refresh token" });
	}
	if (!refreshTokens.includes(refreshToken)) {
		return res.status(403).json({ message: "Invalid refresh token" });
	}
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
		if (error) {
			return res.status(403).json({ message: "Invalid refresh token" });
		}
		const accessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: "15s",
		});
		res.json({ accessToken });
	});
};

const logoutUser = (req, res) => {
	refreshTokens = refreshTokens.filter(token => token !== req.body.token);
	res.status(204).json({ message: "User logged out successfully" });
};

	module.exports = {
	registerUser,
	loginUser,
	getLoggedInUserDetails,
	refreshToken,
	logoutUser,
};