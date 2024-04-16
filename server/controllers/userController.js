const User = require("../models/User");

const getLoggedInUserDetails = async (req, res) => {
	try {
		const userId = req.user;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ firstName: user.firstName, lastName: user.lastName, role: user.isAdmin ? "Admin" : "User" });
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

module.exports = { 
    getLoggedInUserDetails,
    updateUserRole
};