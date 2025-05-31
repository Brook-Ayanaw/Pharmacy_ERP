const express = require('express');
const User = require('../models/User');
const Store = require('../models/Store');
const validateRole = require("../middleware/validateRole");
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");
const router = express.Router();

//home 
router.get('/',(req,res)=>
{
    res.status(200).send('this is the user route');
});

//get all users
router.get('/all', async(req,res)=>
{
    try 
    {
        const users = await User.find().populate('role','name').populate("appointedStore", "name");
        //const users = await User.find().populate('role', 'name -_id'); // if i want to exclude the object id

        if (users.length>0)
            res.status(200).json(users);
        else
            res.status(404).json({message: "no users found"})
        
    } catch(err) 
    {
        res.status(500).json({message: err.message});
    }
})

//find user by id
router.get('/userById/:id', async(req,res)=>
    {
        try 
        {
            const user = await User.findById(req.params.id).populate('role','name').populate("appointedStore", "name");
            //const users = await User.find().populate('role', 'name -_id'); // if i want to exclude the object id
    
            if (!user)
                return res.status(400).json({message : "user not found"});
            res.status(200).json(user);
            
        } catch(err) 
        {
            res.status(500).json({message: err.message});
        }
    })

// Add a new user
router.post('/add', validateRole, async (req, res) => {
    try {
        const { name, phone_number, password, email , role =[]} = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (!phone_number) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        // Create a new User
        const newUser = new User({
            name,
            phone_number,
            password,
            email,
            role : role || []
        });

        // Save the user to the database
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add user role
router.patch('/addUserRole/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { role } = req.body; // Expecting a role ID from the request

        // Validate role input
        if (!role) {
            return res.status(400).json({ message: "No role provided" });
        }

        // Find the user and update their role (avoiding duplicates)
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $addToSet: { role: role } }, // Prevents adding duplicate roles
            { new: true, runValidators: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Role added successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove a role from a user
router.patch('/removeUserRole/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { role } = req.body; // Expecting role ID to be removed

        // Validate role input
        if (!role) {
            return res.status(400).json({ message: "No role provided" });
        }

        // Find the user and remove the role
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $pull: { role: role } }, // Removes the specific role from the array
            { new: true, runValidators: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Role removed successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ✅ Add appointed store to user
router.patch('/addAppointedStore/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { storeId } = req.body;
      if (!storeId) return res.status(400).json({ message: "Missing storeId in body" });

  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const store = await Store.findById(storeId);
      if (!store) return res.status(404).json({ message: "Store not found" });
  
      // Prevent duplicate
      if (user.appointedStore.includes(storeId)) {
        return res.status(400).json({ message: "Store already appointed to user" });
      }
  
      user.appointedStore.push(storeId);
      await user.save();
  
      res.status(200).json({ message: "Store appointed to user", user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
  // ✅ Remove appointed store from user
  router.patch('/removeAppointedStore/:userId/:storeId',authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { userId, storeId } = req.params;
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const store = await Store.findById(storeId);
      if (!store) return res.status(404).json({ message: "Store not found" });
  
      // Check if store exists in appointedStore
      if (!user.appointedStore.includes(storeId)) {
        return res.status(400).json({ message: "Store not appointed to user" });
      }
  
      user.appointedStore = user.appointedStore.filter(id => id.toString() !== storeId);
      await user.save();
  
      res.status(200).json({ message: "Store removed from user", user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


// Edit a user
router.put('/edit/:id', async (req, res) => {
    try {
        const UserId = req.params.id;
        const updateData = req.body;

        // Find the user by ID and update it
        const updatedUser = await User.findByIdAndUpdate(
            UserId,
            updateData,
            { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete a user
router.delete('/delete/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user by ID and delete it
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/edit-profile', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
      const updateData = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.patch('/setBlockStatus/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const { blockStatus } = req.body;
  
      if (!["ok", "block"].includes(blockStatus)) {
        return res.status(400).json({ message: "blockStatus must be either 'ok' or 'block'" });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { blockStatus },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ message: "Block status updated", user: updatedUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  router.get("/users/search", async (req, res) => {
    const { name } = req.query;
    const users = await User.find({ name: { $regex: name, $options: "i" } });
    res.json(users);
});


module.exports = router;