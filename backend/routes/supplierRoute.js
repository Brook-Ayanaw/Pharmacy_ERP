const express = require('express');
const Supplier = require('../models/Supplier');
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");
const router = express.Router();

//home 
router.get('/',(req,res)=>
{
    res.status(200).send('this is the supplier route');
});

//get all suppliers
router.get('/all', async(req,res)=>
{
    try 
    {
        const suppliers = await Supplier.find();
        if (suppliers.length>0)
            res.status(200).json(suppliers);
        else
            res.status(404).json({message: "no Supplier found"})
        
    } catch(err) 
    {
        res.status(500).json({message: err.message});
    }
})

// Add a new supplier
router.post('/add', async (req, res) => {
    try {
        const { name, phone_numbers, account_numbers, email } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        // Create a new supplier
        const newSupplier = new Supplier({
            name,
            phone_numbers,
            account_numbers,
            email
        });

        // Save the supplier to the database
        const savedSupplier = await newSupplier.save();
        res.status(201).json(savedSupplier);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit a supplier
router.put('/edit/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const supplierId = req.params.id;
        const updateData = req.body;

        // Find the supplier by ID and update it
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            supplierId,
            updateData,
            { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!updatedSupplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        res.status(200).json(updatedSupplier);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete a supplier
router.delete('/delete/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const supplierId = req.params.id;

        // Find the supplier by ID and delete it
        const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);

        if (!deletedSupplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ✅ GET a specific supplier by ID
router.get('/get/:id', async (req, res) => {
    try {
      const supplier = await Supplier.findById(req.params.id);
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });
      res.status(200).json(supplier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


module.exports = router;