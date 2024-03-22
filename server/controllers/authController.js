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

        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30m",
        });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET);

        user.refreshTokens.push(refreshToken);
        
        await user.save();

        res.json({ accessToken: accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};

const refreshToken = async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(401).json({ message: "Missing refresh token" });
    }
    
    try {
        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }
            
            const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "30m",
            });
            res.json({ accessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to refresh token" });
    }
};


const logoutUser = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];
    const refreshToken = req.body.token;
    
    if (!accessToken) {
        return res.status(403).json({ message: "Missing token" });
    }

    try {
        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
        res.status(204).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to log out user" });
    }
}

	module.exports = {
	registerUser,
	loginUser,
	refreshToken,
	logoutUser,
};