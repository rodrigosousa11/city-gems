const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

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

		const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: "30d",
		});

		res.json(token);
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

module.exports = {
	registerUser,
	loginUser,
	getLoggedInUserDetails,
};