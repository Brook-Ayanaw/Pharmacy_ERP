const express = require('express');
const Store = require('../models/Store');
const Entiity = require('../models/Entity')
const router = express.Router();
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");

//home 
router.get('/',(req,res)=>
{
    res.status(200).send('this is the Store route');
});

//get all stores
router.get('/all', async(req,res)=>
{
    try 
    {
        const stores = await Store.find().populate('entity', "name -_id").populate('contactPersons','name phone_number -_id');
        if (stores.length>0)
            res.status(200).json(stores);
        else
            res.status(404).json({message: "no store found"})
        
    } catch(err) 
    {
        res.status(500).json({message: err.message});
    }
})

// Add a new store
router.post('/add',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { name, contactPersons = [], entity } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        // add validation
        if(!entity)
            return res.status(400).json({ message: "Entity is required" });
        const theEntity = await Entiity.findById(entity);
        if(!theEntity)
            return res.status(400).json({message : "Invalid Entity"});
    
        // Create a new store
        const newStore = new Store({
            name,
            contactPersons,
            entity
        });

        // Save the store to the database
        const savedStore = await newStore.save();
        res.status(201).json(savedStore);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit store
router.put('/edit/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const storeId = req.params.id;
        const updateData = req.body;

        // Find the store by ID and update it
        const UpdatedStore = await Store.findByIdAndUpdate(
            storeId,
            updateData,
            { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!UpdatedStore) {
            return res.status(404).json({ message: "store not found" });
        }

        res.status(200).json(UpdatedStore);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete a store
router.delete('/delete/:id', async (req, res) => {
    try {
        const storeId = req.params.id;

        // Find the store by ID and delete it
        const deletedStore = await Store.findByIdAndDelete(storeId);

        if (!deletedStore) {
            return res.status(404).json({ message: "Store not found" });
        }

        res.status(200).json({ message: "store deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;