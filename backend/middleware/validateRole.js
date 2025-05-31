const Role = require('../models/Role');

const validateRole = async (req, res, next) => {
    try {
        const { role } = req.body; // Extract roles correctly

        if (!role || role.length === 0) {
            return res.status(400).json({ message: "No role provided" });
        }

        // Check if all roles exist in the database
        for (const roleId of role) {
            const theRole = await Role.findById(roleId);
            if (!theRole) {
                return res.status(404).json({ message: `Invalid role: ${roleId}` });
            }
        }

        next(); // Proceed if all roles are valid
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = validateRole;
