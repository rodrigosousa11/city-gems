const bcrypt = require("bcrypt");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require('nodemailer');
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

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate a 6-character code
        user.resetPasswordToken = verificationCode;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset Verification Code',
            text: `Your verification code is: ${verificationCode}\n\nThis code will expire in 1 hour.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Verification code sent to your email' });
    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyCodeAndResetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.resetPasswordToken || user.resetPasswordToken !== code || user.resetPasswordExpires <= Date.now()) {
            return res.status(400).json({ message: 'Verification code is invalid or has expired' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
        console.error('Error in verifyCodeAndResetPassword:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    requestPasswordReset,
    verifyCodeAndResetPassword,
};