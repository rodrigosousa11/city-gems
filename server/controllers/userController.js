const User = require("../models/User");
const Review = require("../models/Review");
const bcrypt = require("bcrypt");

const getLoggedInUserDetails = async (req, res) => {
    try {
        const userId = req.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

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
        
        // Toggle user role
        user.role = user.role === 'admin' ? 'user' : 'admin';
        await user.save();
        
        res.json({ message: `User role updated to ${user.role} successfully` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to update user role" });
    }
};

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

const deleteUserAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(`Received request to delete account for email: ${email}`);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User found:", user.email);

        // Check if password is provided and compare it
        if (password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log("Password mismatch:", password, user.password);
                return res.status(401).json({ message: "Invalid password" });
            }
            console.log("Password match");
        }

        // Delete associated reviews
        await Review.deleteMany({ user: user._id });
        console.log("Associated reviews deleted");

        // Proceed with account deletion
        await User.findByIdAndDelete(user._id);
        console.log("User account deleted successfully");
        res.json({ message: "User account deleted successfully" });

    } catch (error) {
        console.error("Failed to delete user account:", error);
        res.status(500).json({ message: "Failed to delete user account" });
    }
};




module.exports = { 
    getLoggedInUserDetails,
    updateUserRole,
    updateUserDetails,
    deleteUserAccount
};
