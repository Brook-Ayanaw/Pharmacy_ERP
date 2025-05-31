const express = require('express');
const CreditCustomer = require('../models/CreditCustomer');
const router = express.Router();
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");

// Home
router.get('/', (req, res) => {
  res.status(200).send('This is the Credit Customer route');
});

// Get all Credit customers
router.get('/all', async (req, res) => {
  try {
    const creditCustomers = await CreditCustomer.find();
    if (creditCustomers.length > 0)
      res.status(200).json(creditCustomers);
    else
      res.status(404).json({ message: "No Credit Customers found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/add', async (req, res) => {
    try {
      let { name, email, phoneNumber, balance, isValid } = req.body;
  
      if (!name || !email || !phoneNumber) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      if (balance === undefined) balance = 0;
      if (isValid === undefined) isValid = true;
  
      const newCreditCustomer = new CreditCustomer({
        name,
        email,
        phoneNumber,
        balance,
        isValid,
      });
  
      await newCreditCustomer.save();
      res.status(200).json(newCreditCustomer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// Block or Unblock Credit Customer
router.patch('/blockUnblock/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = req.params.id;
  
      // Find the customer
      const creditCustomer = await CreditCustomer.findById(id);
      if (!creditCustomer) {
        return res.status(404).json({ message: "Credit customer not found" });
      }
  
      // Toggle isValid status
      creditCustomer.isValid = !creditCustomer.isValid;
      await creditCustomer.save();
  
      res.status(200).json({
        message: `Credit customer ${creditCustomer.isValid ? "unblocked" : "blocked"} successfully`,
        creditCustomer
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// Update a credit customer by ID
router.patch('/edit/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = req.body;
  
      const creditCustomer = await CreditCustomer.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
  
      if (!creditCustomer) {
        return res.status(404).json({ message: "Credit customer not found." });
      }
  
      res.status(200).json({
        message: "Credit customer updated successfully.",
        creditCustomer,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  router.get('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const customer = await CreditCustomer.findById(req.params.id);
      if (!customer) return res.status(404).json({ message: 'Not found' });
      res.status(200).json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // ✅ Refill balance for a credit customer
router.patch('/refill/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const customer = await CreditCustomer.findById(id);
    if (!customer) return res.status(404).json({ message: 'Credit customer not found' });

    customer.balance += amount;
    await customer.save();

    res.status(200).json({
      message: "Balance refilled successfully",
      updatedCustomer: customer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

  
module.exports = router;
