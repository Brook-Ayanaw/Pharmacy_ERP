const express = require('express');
const SaleHistory = require('../models/SaleHistory');
const User = require('../models/User');
const Product = require('../models/Product');
const DeletedSalesHistory = require('../models/DeletedSalesHistory');
const Brand = require('../models/Brand')
const validatePatient = require('../middleware/validatePatient');
const checkRole = require('../middleware/checkRole');
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");
const authorizePharmacist = require("../middleware/autorizePharmacist");
const BinCard = require("../models/BinCard");

const router = express.Router();

// ✅ Home Route
router.get('/', (req, res) => {
    res.status(200).send('This is the Sales route');
});

// ✅ Get all sales with proper population
router.get('/all', async (req, res) => {
    try {
        const sales = await SaleHistory.find()
            .populate({ path: 'product', select: 'name price' }) // ✅ Fix lowercase reference
            .populate({ path: 'user', select: 'name' }) // ✅ Fix lowercase reference
            .sort({ createdAt: -1 });
        
        if (sales.length > 0) {
            res.status(200).json(sales);
        } else {
            res.status(404).json({ message: "No sales found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.post('/sellHistoryByDate', async (req, res) => {
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
  
      const sales = await SaleHistory.find(query)
        .populate({ path: 'product', select: 'name price' })
        .populate({ path: 'user', select: 'name' })
        .populate({ path: 'fromStore', select: 'name' }) // ✅ fix here
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
        const { productId, quantity, patientId, customerName } = req.body;
        const userId = req.user.id; // ✅ Extracted from JWT

        // ✅ Validate required fields
        if (!productId || !userId || !quantity) {
            return res.status(400).json({ message: "Missing required fields (productId, userId, quantity)" });
        }

        if (!patientId && !customerName) {
            return res.status(400).json({ message: "Either 'patientId' or 'customerName' must be provided." });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const brand = await Brand.findById(product.brand);
        if (!brand) return res.status(404).json({ message: "Brand not found" });

        if (!brand.sellingPrice) {
            return res.status(400).json({ message: "Product price is missing or invalid." });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const totalPrice = Number(brand.sellingPrice) * Number(quantity);

        // ✅ Deduct stock
        product.quantity -= quantity;
        await product.save();

        brand.quantity -= quantity;
        await brand.save();

        // ✅ Log sale
        const sale = new SaleHistory({
            product: productId,
            user: userId,
            quantity,
            totalPrice,
            patientId: patientId || null,
            customerName: customerName || null,
            fromStore : product.store,
        });
        await sale.save();

        // ✅ Add bin card entry
        const theBinCard = new BinCard({
            itemCode: product._id,
            brand: brand._id,
            name: product.name,
            unitOfMeasure: brand.sellingUnit,
            category: brand.category,
            issuedQuantity: quantity,
            issuedTo: "Sale's",
            receivedQuantity: 0,
            receivedFrom: null,
            batch: product.brand,
            expiry_date: product.expiry_date,
            purchase_invoice: product.purchase_invoice,
            supplier: product.supplier,
            store: product.store,
            remark: "sell"
        });
        await theBinCard.save();

        res.status(200).json({ message: "Product sold successfully", sale });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Delete a sale (Only Admin & Finance)
router.delete('/deleteSale/:saleId', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { saleId } = req.params;
        const { reason } = req.body;
        const deletedBy = req.user.id;

        // ✅ Validate required fields
        if (!saleId || !deletedBy || !reason) {
            return res.status(400).json({ message: "Missing required fields (saleId, deletedBy, reason)." });
        }

        // ✅ Fetch the sale record
        const sale = await SaleHistory.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: "Sale record not found." });
        }

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

        // ✅ Remove the sale from SaleHistory
        await SaleHistory.findByIdAndDelete(saleId);

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
                store: product.store,
                remark : "Deleted sell return"
                
            }
        )
        await theBinCard.save();

        res.status(200).json({ message: "Sale record deleted successfully, product stock restored", deletedSale });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ List Deleted Sales with optional filters
router.get('/listDeleted', async (req, res) => {
    try {
      const { date, storeId } = req.body;
  
      const query = {};
  
      // Apply store filter if provided
      if (storeId) {
        query.fromStore = storeId;
      }
  
      // Apply date filter if provided
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.originalSaleDate = { $gte: start, $lte: end };
      }
  
      const deletedSales = await DeletedSalesHistory.find(query)
        .populate('product', 'name')
        .populate('fromStore', 'name')
        .populate('deletedBy', 'name')
        .sort({ originalSaleDate: -1 });
  
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
router.post("/sellHistoryByStores", async (req, res) => {
    try {
      const { date, storeIds } = req.body;
  
      if (!Array.isArray(storeIds) || storeIds.length === 0) {
        return res.status(400).json({ message: "storeIds array is required" });
      }
  
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
  
      const sales = await SaleHistory.find({
        fromStore: { $in: storeIds },
        createdAt: { $gte: start, $lte: end }
      })
      .populate({ path: 'product', select: 'name price' })
      .populate({ path: 'user', select: 'name' })
      .populate({ path: 'fromStore', select: 'name' }) // ✅ fix here
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
