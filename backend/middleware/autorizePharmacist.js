// middlewares/authorizeAdmin.js
const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.roleByName.includes("pharmacist")) {
      return res.status(403).json({ message: "Access denied: Pharmacists only" });
    }
    next();
  };
  
  module.exports = authorizeAdmin;
  