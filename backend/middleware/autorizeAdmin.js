// middlewares/authorizeAdmin.js
const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.roleByName.includes("admin")) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
  };
  
  module.exports = authorizeAdmin;
  