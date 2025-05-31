const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const DeletedSalesHistory = require('../models/DeletedSalesHistory');
const Brand = require('../models/Brand')
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");
const authorizePharmacist = require("../middleware/autorizePharmacist");
const BinCard = require("../models/BinCard");
const CreditSaleHistory = require('../models/CreditSellHistory');
const CreditCustomer = require('../models/CreditCustomer');

const router = express.Router();

// ✅ Home Route
router.get('/', (req, res) => {
    res.status(200).send('This is the credit sales route');
});

router.get('/credit/all', async (req, res) => {
    try {
      const creditSales = await CreditSaleHistory.find()
        .populate('product', 'name price')
        .populate('user', 'name')
        .populate('creditCustomer', 'name email')
        .populate('fromStore', 'name')
        .sort({ createdAt: -1 });
  
      res.status(200).json(creditSales);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
router.post('/creditSellHistoryByDate', async (req, res) => {
    try {
      const { date, storeId } = req.body;
  
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
  
      const query = {
        createdAt: { $gte: start, $lte: end }
      };
  
      if (storeId) {
        query.fromStore = storeId; // ✅ fix here
      }
  
      const sales = await CreditSaleHistory.find(query)
        .populate({ path: 'product', select: 'name price' })
        .populate({ path: 'user', select: 'name' })
        .populate({ path: 'fromStore', select: 'name' }) // ✅ fix here
        .populate('creditCustomer', 'name email')
        .sort({ createdAt: -1 });
  
      if (sales.length > 0) {
        res.status(200).json(sales);
      } else {
        res.status(404).json({ message: "No sales found." });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
  

  router.post('/sell', authenticate, authorizePharmacist, async (req, res) => {
    try {
      const {
        productId,
        quantity,
        creditCustomer,
        patientId,
        customerName
      } = req.body;
  
      const userId = req.user.id;
  
      // Validate required fields
      if (!productId || !userId || !quantity || !creditCustomer) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      if (!patientId && !customerName) {
        return res.status(400).json({ message: "Either 'patientId' or 'customerName' must be provided." });
      }
  
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
  
      const brand = await Brand.findById(product.brand);
      if (!brand || !brand.sellingPrice) {
        return res.status(404).json({ message: "Brand not found or missing price" });
      }
  
      if (product.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const theCreditCustomer = await CreditCustomer.findById(creditCustomer);
      if(!theCreditCustomer)
        return res.status(404).json({message : "The credit customer is not found"})
      if(theCreditCustomer.isValid === false)
        return res.status(300).json({message : "The credit customer is blocked"})
  
      const totalPrice = Number(brand.sellingPrice) * Number(quantity);
  
      // Deduct stock
      product.quantity -= quantity;
      brand.quantity -= quantity;
      await product.save();
      await brand.save();
  
      // Save credit sale
      const creditSale = new CreditSaleHistory({
        product: productId,
        user: userId,
        quantity,
        totalPrice,
        patientId: patientId || null,
        customerName: customerName || null,
        fromStore: product.store,
        creditCustomer,
        paymentStatus: "unpaid"
      });
  
      await creditSale.save();
  
      // Add to bin card
      const binCard = new BinCard({
        itemCode: product._id,
        brand: brand._id,
        name: product.name,
        unitOfMeasure: brand.sellingUnit,
        category: brand.category,
        issuedQuantity: quantity,
        issuedTo: `Credit Sale: ${customerName} ${creditCustomer}`,
        receivedQuantity: 0,
        receivedFrom: null,
        batch: product.brand,
        expiry_date: product.expiry_date,
        purchase_invoice: product.purchase_invoice,
        supplier: product.supplier,
        store: product.store,
      });
  
      await binCard.save();
      theCreditCustomer.balance -= totalPrice;
      await theCreditCustomer.save();
      res.status(200).json({ message: "✅ Credit sale recorded", creditSale });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  


// ✅ Delete a credit sale (Only Admin & Finance)
router.delete('/deleteCreditSale/:saleId', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { saleId } = req.params;
        const { reason } = req.body;
        const deletedBy = req.user.id;
        // ✅ Validate required fields
        if (!saleId  || !reason) {
            return res.status(400).json({ message: "Missing required fields (saleId, deletedBy, reason)." });
        }

        // ✅ Fetch the sale record
        const sale = await CreditSaleHistory.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: "Sale record not found." });
        }
        // Fetch the Credit Customer
        const theCreditCustomer = await CreditCustomer.findById(sale.creditCustomer);
        if(!theCreditCustomer)
            return res.status(404).json({message : "The Credit customer not found"})
        // ✅ Fetch the associated product
        const product = await Product.findById(sale.product);
        if (!product) {
            return res.status(404).json({ message: "Associated product not found." });
        }

        // ✅ Fetch the associated product
        const brand = await Brand.findById(product.brand);
        if (!brand) {
            return res.status(404).json({ message: "Associated Brand not found." });
        }

        // ✅ Restore the product stock
        product.quantity += sale.quantity;
        await product.save();

        // ✅ Restore the Brand stock
        brand.quantity += sale.quantity;
        await brand.save();

        // ✅ Move the sale to the deleted sales history
        const deletedSale = new DeletedSalesHistory({
            product: sale.product,
            user: sale.user,
            quantity: sale.quantity,
            reason: reason,
            deletedBy: deletedBy,
            originalSaleDate: sale.createdAt,
            fromStore : sale.fromStore,
        });

        await deletedSale.save();

        // ✅ Remove the sale from CreditSaleHistory
        await CreditSaleHistory.findByIdAndDelete(saleId);

        //Adding to the bin card
        const theBinCard = new BinCard(
            {
                itemCode: product._id,
                brand: brand._id,
                name: product.name,
                unitOfMeasure: brand.sellingUnit,
                category: brand.category,
                issuedQuantity: 0,
                issuedTo: null,
                receivedQuantity: sale.quantity,
                receivedFrom: reason || "Refund",
                batch: product.brand,
                expiry_date: product.expiry_date,
                purchase_invoice: product.purchase_invoice,
                supplier: product.supplier,
                store: product.store
                
            }
        )
        await theBinCard.save();
        // restore the credit customers balance
         theCreditCustomer.balance += sale.totalPrice;
         await theCreditCustomer.save();
        res.status(200).json({ message: "CreditSale record deleted successfully, product stock restored", deletedSale });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ List Deleted Sales
router.get('/listDeleted', async (req, res) => {
    try {
        const deletedSales = await DeletedSalesHistory.find().populate('product', 'name').populate('fromStore', 'name');
        if (deletedSales.length === 0) {
            res.status(404).json({ message: "No deleted sales found" });
        } else {
            res.status(200).json(deletedSales);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

//this is for filtering from all my stores 
router.post("/creditSellHistoryByStores", async (req, res) => {
    try {
      const { date, storeIds } = req.body;
  
      if (!Array.isArray(storeIds) || storeIds.length === 0) {
        return res.status(400).json({ message: "storeIds array is required" });
      }
  
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
  
      const sales = await CreditSaleHistory.find({
        fromStore: { $in: storeIds },
        createdAt: { $gte: start, $lte: end }
      })
      .populate({ path: 'product', select: 'name price' })
      .populate({ path: 'user', select: 'name' })
      .populate({ path: 'fromStore', select: 'name' }) // ✅ fix here
      .populate({path: 'creditCustomer', select: 'name'})
      .sort({ createdAt: -1 });
  
      if (sales.length > 0) {
        res.status(200).json(sales);
      } else {
        res.status(404).json({ message: "No sales found." });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
module.exports = router;
