const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role')
const jwt = require('jsonwebtoken');

const JWT_SECRET = "your_secret_key"; // Store this in an environment variable in production

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Missing credentials" });

        const user = await User.findOne({ email: email });
        if (!user)
            return res.status(400).json({ message: "Entered credentials are incorrect" });
        if(user.blockStatus !== "ok" || user.blockStatus === "block")
            return res.status(403).json({message : "blocked account"});
        if (password === user.password) {
            // Create JWT payload
            const theRolesName = [];
            for(let i of user.role)
            {
                let aRole = await Role.findById(i)
                theRolesName.push(aRole.name);
            }
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role, // assuming you have role or similar
                roleByName : theRolesName,
                appointedStore : user.appointedStore
            };

            // Sign token
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            //console.log(token);
            return res.status(200).json({ token });
        } else {
            return res.status(400).json({ message: "Incorrect password" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
