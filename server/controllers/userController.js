const User = require("../models/User");
const bcrypt = require("bcrypt");

const getLoggedInUserDetails = async (req, res) => {
    try {
        const userId = req.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = user.isAdmin ? 'Admin' : 'User';

        res.json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch user details" });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isAdmin = true;
        await user.save();
        res.json({ message: "User role updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to update user role" });
    }
}

const updateUserDetails = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        res.json({ message: "User details updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to update user details" });
    }
}

module.exports = { 
    getLoggedInUserDetails,
    updateUserRole,
    updateUserDetails
};