const express = require('express');
const Entity = require('../models/Entity');
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");

const router = express.Router();

//home 
router.get('/',(req,res)=>
{
    res.status(200).send('this is the Entity route');
});

//get all entities
router.get('/all', async(req,res)=>
{
    try 
    {
        const entities = await Entity.find();
        if (entities.length>0)
            res.status(200).json(entities);
        else
            res.status(404).json({message: "no entity found"})
        
    } catch(err) 
    {
        res.status(500).json({message: err.message});
    }
})

//det entity by id
router.get('/entityById/:id', async (req,res) =>
{
    try
    {
        const entity = await Entity.findById(req.params.id);
        if(!entity)
            return res.status(404).json({message : "Entity not found"});
        res.status(200).json(entity);
    }catch(error)
    {
        res.status(500).json({message : error.message})
    }
})

// Add a new Entity
router.post('/add',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { name, phoneNumbers, address, accountNumbers } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        // Create a new entity
        const newEntity = new Entity({
            name,
            phoneNumbers,
            address,
            accountNumbers
        });

        // Save the entity to the database
        const savedEntity = await newEntity.save();
        res.status(201).json(savedEntity);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit entity
router.put('/edit/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const entityId = req.params.id;
        const updateData = req.body;

        // Find the entity by ID and update it
        const updatedEntity = await Entity.findByIdAndUpdate(
            entityId,
            updateData,
            { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!updatedEntity) {
            return res.status(404).json({ message: "Entity not found" });
        }

        res.status(200).json(updatedEntity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete an entity
router.delete('/delete/:id', async (req, res) => {
    try {
        const entityId = req.params.id;

        // Find the supplier by ID and delete it
        const deletedEntity = await Entity.findByIdAndDelete(entityId);

        if (!deletedEntity) {
            return res.status(404).json({ message: "Entity not found" });
        }

        res.status(200).json({ message: "Entiity deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;