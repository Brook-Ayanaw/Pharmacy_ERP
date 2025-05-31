const User = require("../models/User");

const checkBlocked = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user found in request" });
    }

    const user = await User.findById(userId).select("blockStatus");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.blockStatus === "block") {
      return res.status(403).json({ message: "Access denied: User is blocked" });
    }

    next();
  } catch (err) {
    console.error("Error in checkBlocked middleware:", err);
    return res.status(500).json({ message: "Server error while checking block status" });
  }
};

module.exports = checkBlocked;
