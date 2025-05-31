const User = require('../models/User');

const checkRole = async (req, res, next) => {
    try {
        const { deletedBy } = req.body; // Get the user trying to delete the sale

        if (!deletedBy) {
            return res.status(403).json({ message: "Unauthorized: User ID is required." });
        }

        // Fetch user and check their role
        const user = await User.findById(deletedBy).populate('role');

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Extract role names from populated role array
        const userRoles = user.role.map(r => r.name.toLowerCase()); // Convert to lowercase

        // Only allow 'admin' or 'finance' to proceed
        if (!userRoles.includes('admin') && !userRoles.includes('finance')) {
            return res.status(403).json({ message: "Unauthorized: Only Admin or Finance can delete sales." });
        }

        next(); // User is authorized, proceed to delete
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = checkRole;
