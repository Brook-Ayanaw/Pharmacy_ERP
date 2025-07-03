const express = require('express');
const Product = require('../models/Product');
const Store = require('../models/Store');
const TransferHistory = require('../models/TransferHistory');
const User = require('../models/User');
const Brand = require('../models/Brand');
const Supplier = require('../models/Supplier');
const BinCard = require('../models/BinCard');
const DamagedProducts = require('../models/DamagedProducts');
const router = express.Router();
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/autorizeAdmin");
//home 
router.get('/',(req,res)=>
{
    res.status(200).send('this is the product route');
});
// ✅ Get product by ID
router.get('/find/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate("supplier", "name")
        .populate("entity", "name")
        .populate("brand", "name category quantity sellingPrice minStock sellingUnit")
        .populate("store", "name");
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: "Server error: " + err.message });
    }
  });

// ✅ Get all brands
router.get('/allBrand', async (req, res) => {
    try {
        const brands = await Brand.find()
        .populate('store' , "name");
        if (brands.length === 0) {
            return res.status(404).json({ message: "No brands found" });
        }
        res.status(200).json(brands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/byStoreAndBrand', async (req, res) => {
    try {
      const { storeId, brandId } = req.query;
  
      if (!storeId || !brandId) {
        return res.status(400).json({ message: "Missing storeId or brandId" });
      }
  
      const products = await Product.find({
        store: storeId,
        brand: brandId
      })
      .populate('store')  // only if you need store details in the frontend
      .sort({ createdAt: -1 });
  
      res.json(products);
    } catch (err) {
      console.error('Error in /product/byStoreAndBrand:', err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  });
//search product by brand
router.get('/productsbybrand', async (req,res) => 
{
    try{
        const brandId = req.body.brandId;
        const productsSearched = await Product.find({brand : brandId}).sort({createdAt: -1});
        if(!productsSearched)
            return res.status(400).json({message : "no Product found"});
        return res.status(200).json(productsSearched);
    }catch(error)
    {
        res.status(500).json({message : error.message});
    }
})
// ✅ Get all products with amount grater than 0
router.get('/allProduct', async (req, res) => {
    try {
        const products = await Product.find({quantity : {$gt : 0}})
            .populate("supplier", "name")
            .populate("entity", "name")
            .populate("brand", "name category quantity sellingPrice") // Fetch brand details including quantity
            .populate("store", "name");

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get all products 
router.get('/theAllProduct', async (req, res) => {
    try {
        const products = await Product.find()
            .populate("supplier", "name")
            .populate("entity", "name")
            .populate("brand", "name category quantity sellingPrice") // Fetch brand details including quantity
            .populate("store", "name");

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Edit a brand
router.put('/editBrand/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const brandId = req.params.id;
        const updateData = req.body;

        if(updateData.quantity)
            return res.status(400).json({message : "Unable to edit quantity"});
        // Find the brand by ID and update it
        const updatedBrand = await Brand.findByIdAndUpdate(
            brandId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBrand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        
        res.status(200).json({ message: "Brand updated successfully", updatedBrand });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Edit a product (With Quantity Update)
router.put('/editProduct/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity, brand, ...updateData } = req.body;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingBrand = await Brand.findById(existingProduct.brand);
    if (!existingBrand) {
      return res.status(404).json({ message: "Associated brand not found" });
    }

    // ✅ Update Brand Quantity
    const currentQuantity = Number(existingProduct.quantity);
    const newQuantity = Number(quantity);
    const QD = newQuantity - currentQuantity;

    if (quantity && newQuantity !== currentQuantity) {
      existingBrand.quantity += QD;
      await existingBrand.save();
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { quantity: newQuantity, ...updateData },
      { new: true, runValidators: true }
    );

    // ✅ Create BinCard entry if quantity changed
    if (QD !== 0) {
      try {
        if (!existingProduct.supplier) {
          return res.status(400).json({ message: "Missing supplier info for BinCard entry." });
        }

        const newBinCard = new BinCard({
          itemCode: existingProduct._id,
          brand: existingBrand._id,
          name: existingProduct.name,
          unitOfMeasure: existingBrand.sellingUnit,
          category: existingProduct.category,
          issuedQuantity: QD > 0 ? 0 : Math.abs(QD),
          issuedTo: "Editing product",
          receivedQuantity: QD > 0 ? QD : 0,
          receivedFrom: "Editing product",
          batch: existingProduct.batch,
          expiry_date: new Date(existingProduct.expiry_date), // ✅ fixed
          purchase_invoice: existingProduct.purchase_invoice,
          supplier: existingProduct.supplier,
          store: existingProduct.store,
          remark: "Editing product"
        });

        await newBinCard.save();
      } catch (binErr) {
        console.error("BinCard creation error:", binErr);
        // Optionally: return res.status(500).json({ message: "Product updated but BinCard failed." });
      }
    }

    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Delete a product (With Quantity Update)
router.delete('/deleteProduct/:id',authenticate, authorizeAdmin, async (req, res) => {
    try {
        const productId = req.params.id;

        // Find the product
        const productToDelete = await Product.findById(productId);
        if (!productToDelete) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Find the associated brand
        const associatedBrand = await Brand.findById(productToDelete.brand);
        if (!associatedBrand) {
            return res.status(404).json({ message: "Associated brand not found" });
        }

        // ✅ Update Brand Quantity
        associatedBrand.quantity -= productToDelete.quantity;
        await associatedBrand.save();

        // ✅ Delete the product
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: "Product deleted successfully", deletedProduct: productToDelete });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get all products by invoice number
router.post('/allByInvoice', async(req,res)=>
    {
        try 
        {
            const invoiceNumber = req.body.invoiceNumber;
            let totalPrice = 0;
            if(!invoiceNumber)
                return res.status(400).json({message : "please enter a valid invoice number"});
            const products = await Product.find({purchase_invoice : invoiceNumber, purchaseQuantity : {$gt : 0}})
            .populate("supplier", "name")
            .populate("entity", "name")
            .populate("store", "name")
            .populate("brand", "name minStock sellingPrice quantity");
            if (products.length>0)
            {
                for(let product of products)
                {
                    totalPrice = totalPrice + (product.buyingPrice * product.purchaseQuantity);
                }
                //console.log(totalPrice+ " "+ products)
                res.status(200).json({total_price : totalPrice, the_products :products});
            }
                
            else
                res.status(404).json({message: "no Product found"})
            
        } catch(err) 
        {
            res.status(500).json({message: err.message});
        }
    })


// ✅ Add a new brand and product
router.post('/addNewBrandProduct', async (req, res) => {
    try {
        let { name, buyingPrice, sellingPrice, sellingUnit, category, quantity, supplier, expiry_date, purchase_invoice, minStock, batch, store } = req.body;

        // ✅ Validate required fields
        if (!name || !buyingPrice || !category || !quantity || !supplier || !expiry_date || !minStock || !store || !sellingUnit) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // ✅ Validate store
        const validatedStore = await Store.findById(store);
        if (!validatedStore) {
            return res.status(404).json({ message: "Invalid store input" });
        }

        // ✅ Validate supplier
        const validateSupplier = await Supplier.findById(supplier);
        if (!validateSupplier) {
            return res.status(404).json({ message: "Invalid supplier" });
        }

        // ✅ Fix selling price if not provided
        sellingPrice = sellingPrice || buyingPrice * 1.3;

        const entity = validatedStore.entity;

        // ✅ Creating the brand it self
         let existingBrand = new Brand({
                name,
                category,
                minStock,
                quantity,
                sellingUnit,
                sellingPrice,
                store,
                entity
            });
            await existingBrand.save();
        

        // ✅ Create a new product with the brand reference
        const newProduct = new Product({
            name,
            buyingPrice,
            category,
            quantity,
            purchaseQuantity : quantity,
            supplier,
            expiry_date,
            purchase_invoice,
            entity,
            brand: existingBrand._id, // Use the brand's ID
            batch,
            store
        });

        const savedProduct = await newProduct.save();
        // ✅ Create bin card entry
    const newBinCard = new BinCard({
      itemCode: savedProduct._id,
      brand: existingBrand._id,
      name,
      unitOfMeasure: sellingUnit,
      category,
      issuedQuantity: 0,
      issuedTo: null,
      receivedQuantity: quantity,
      receivedFrom: validateSupplier.name,
      batch,
      expiry_date,
      purchase_invoice,
      supplier: validateSupplier._id,
      store,
      remark : "Adding new Brand product"
    });

    const savedBinCard = await newBinCard.save();

    res.status(201).json({
      message: "Brand and product added successfully",
      savedProduct,
      existingBrand,
      savedBinCard
    });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/RefillBrandProduct', async (req, res) => {
    try {
        let { brandID, buyingPrice, sellingPrice, quantity, supplier, expiry_date, purchase_invoice, batch } = req.body;

        // Convert numeric fields to numbers
        buyingPrice = Number(buyingPrice);
        quantity = Number(quantity);
        // If sellingPrice is provided, convert it; otherwise, calculate it
        sellingPrice = sellingPrice ? Number(sellingPrice) : buyingPrice * 1.3;

        // Validate required fields
        if (!buyingPrice || !quantity || !supplier || !expiry_date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate supplier
        const validateSupplier = await Supplier.findById(supplier);
        if (!validateSupplier) {
            return res.status(404).json({ message: "Invalid supplier" });
        }

        // Fetch the existing brand from the Brand collection (not from Product)
        const oldBrand = await Brand.findById(brandID);
        if (!oldBrand) {
            return res.status(404).json({ message: "The Brand doesn't exist" });
        }

        // Create a new product entry (refill record) in the Product collection
        const newProduct = new Product({
            name: oldBrand.name,
            buyingPrice,
            category: oldBrand.category,
            quantity,                // This is the refill quantity
            purchaseQuantity: quantity,
            supplier,
            expiry_date,
            purchase_invoice,
            entity: oldBrand.entity,
            brand: brandID,
            batch,
            store: oldBrand.store
        });

        // Update the brand's quantity correctly (as a number)
        oldBrand.quantity = Number(oldBrand.quantity) + quantity;
        oldBrand.sellingPrice = sellingPrice;
        await oldBrand.save();

        const savedProduct = await newProduct.save();

        // Create new bin card entry
    const newBinCard = new BinCard({
        itemCode: savedProduct._id,
        brand: brandID,
        name: savedProduct.name,
        unitOfMeasure: oldBrand.sellingUnit,
        category: oldBrand.category,
        issuedQuantity: 0,
        issuedTo: null,
        receivedQuantity: quantity,
        receivedFrom: validateSupplier.name,
        batch,
        expiry_date,
        purchase_invoice,
        supplier: validateSupplier._id,
        store: oldBrand.store,
        remark : "Refilling Product"
      });
  
      const savedBinCard = await newBinCard.save();
  
      res.status(201).json({
        message: "Product refilled successfully",
        savedProduct,
        savedBinCard
      });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// List products expiring within a year (sorted from soonest to latest)
router.get('/shortExpiring', async (req, res) => {
    try {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        // Get products expiring within the next 12 months, sorted by expiry date (ascending)
        const shortExpiring = await Product.find({ expiry_date: { $lt: oneYearFromNow } })
            .sort({ expiry_date: 1 }).populate('store','name'); // Sort in ascending order (soonest to latest)

        if (shortExpiring.length === 0) {
            return res.status(404).json({ message: "No short-expiring products found" });
        }

        res.status(200).json(shortExpiring);
    } catch (err) {
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

// List products expiring within a user-defined number of months
router.get('/shortExpiringWithMonth', async (req, res) => {
    try {
        // Get the number of months from query parameters (default to 12 if not provided)
        const months = parseInt(req.query.month) || 12;
        if (months <= 0) {
            return res.status(400).json({ message: "Months must be greater than 0" });
        }

        const expiryLimit = new Date();
        expiryLimit.setMonth(expiryLimit.getMonth() + months); // Add user-defined months

        // Fetch products expiring within the specified months and sort ascending
        const shortExpiring = await Product.find({ expiry_date: { $lt: expiryLimit },quantity : {$gt : 0} })
            .sort({ expiry_date: 1 }).populate('store','name'); // Soonest to latest

        if (shortExpiring.length === 0) {
            return res.status(404).json({ message: `No products expiring within ${months} months` });
        }

        res.status(200).json(shortExpiring);
    } catch (err) {
        res.status(500).json({ message: "Server error: " + err.message });
    }
});


// List expired products
router.get('/expired', async (req, res) => {
    try {
        const today = new Date();

        // Fetch expired products directly from the database
        const expired = await Product.find({ expiry_date: { $lt: today } })
            .sort({ expiry_date: 1 }); // Sort from oldest expired to newest

        if (expired.length === 0) {
            return res.status(404).json({ message: "No expired products found" });
        }

        res.status(200).json(expired);
    } catch (err) {
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

// /// Transfer product to another store
// router.put('/transfer/:id', async (req, res) => {
//     try {
//         const productId = req.params.id;
//         const { quantity, senderId, receiverId, price } = req.body;

//         // Validate fields
//         if (!productId || !quantity || !senderId || !receiverId) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         // Prevent self-transfer
//         if (senderId === receiverId) {
//             return res.status(400).json({ message: "Sender and receiver stores cannot be the same" });
//         }

//         // Check if product exists
//         const product = await Product.findOne({ _id: productId, store: senderId });
//         if (!product) {
//             return res.status(404).json({ message: "Product not found in sender store" });
//         }

//         // Check if sender and receiver stores exist
//         const senderExists = await Store.exists({ _id: senderId });
//         const receiverExists = await Store.exists({ _id: receiverId });

//         if (!senderExists) return res.status(404).json({ message: "Sender store does not exist" });
//         if (!receiverExists) return res.status(404).json({ message: "Receiver store does not exist" });

//         // Check if sender store has enough stock
//         if (product.quantity < quantity) {
//             return res.status(400).json({ message: "Not enough stock in sender store" });
//         }

//         // Deduct quantity from sender store
//         product.quantity -= quantity;
//         await product.save();

//         // Check if the product already exists in the receiver store
//         let receiverProduct = await Product.findOne({ name: product.name, store: receiverId });

//         if (receiverProduct && (receiverProduct.batch === product.batch)) {
//             // If the product exists in the receiver store, just increase its quantity
//             receiverProduct.quantity += quantity;
//         } else {
//             // If the product does not exist, create a new record
//             receiverProduct = new Product({
//                 name: product.name,
//                 buying_price: product.buying_price,
//                 selling_price: product.selling_price,
//                 category: product.category,
//                 quantity: quantity,
//                 supplier: product.supplier,
//                 expiry_date: product.expiry_date,
//                 purchase_invoice: product.purchase_invoice,
//                 minStock: product.minStock,
//                 entity: product.entity,
//                 batch: product.batch,
//                 store: receiverId,
//             });
//         }
//         await receiverProduct.save();

//         // Save transfer history
//         const transferRecord = new TransferHistory({
//             product: productId,
//             senderStore: senderId,
//             receiverStore: receiverId,
//             quantity,
//             price: price || product.selling_price, // Use provided price or default selling price
//         });
//         await transferRecord.save();

//         res.status(200).json({ message: "Product transferred successfully", transferRecord });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// ✅ Request a product transfer (Sets status to pending)
router.put('/transfer/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      let { quantity, senderId, receiverId, price } = req.body;
  
      if (!productId || !quantity || !senderId || !receiverId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      if (senderId === receiverId) {
        return res.status(400).json({ message: "Sender and receiver stores cannot be the same" });
      }
  
      const product = await Product.findOne({ _id: productId, store: senderId }).populate("brand");
      if (!product) return res.status(404).json({ message: "Product not found in sender store" });
  
      const brand = await Brand.findById(product.brand);
      if (!brand) return res.status(404).json({ message: "Associated brand not found" });
  
      price = price || brand.sellingPrice;
  
      const [senderExists, receiverExists] = await Promise.all([
        Store.exists({ _id: senderId }),
        Store.exists({ _id: receiverId }),
      ]);
  
      if (!senderExists) return res.status(404).json({ message: "Sender store does not exist" });
      if (!receiverExists) return res.status(404).json({ message: "Receiver store does not exist" });
  
      if (product.quantity < quantity) {
        return res.status(400).json({ message: "Not enough stock in sender store" });
      }
  
      const transferRecord = new TransferHistory({
        product: productId,
        senderStore: senderId,
        receiverStore: receiverId,
        quantity,
        price,
        batch: product.batch,
        status: "pending",
      });
  
      await transferRecord.save();
      res.status(200).json({ message: "Transfer request submitted", transferRecord });
  
    } catch (error) {
      console.error("Error in transfer request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ✅ Get all transfers with optional date filter
router.get('/transfers', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transfers = await TransferHistory.find(query)
      .populate("product", "name")
      .populate("senderStore", "name -_id")
      .populate("receiverStore", "name -_id");

    return res.status(200).json({ message: transfers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

  
  // ✅ Approve or Reject a transfer
  router.put('/approveTransfer/:transferId', async (req, res) => {
    try {
      let { status, userId, newPrice, minStock } = req.body;
      const transfer = await TransferHistory.findById(req.params.transferId);
  
      if (!transfer) return res.status(404).json({ message: "Transfer request not found" });
      if (transfer.status !== "pending") return res.status(400).json({ message: "Transfer already processed" });
  
      const receiverStore = await Store.findById(transfer.receiverStore);
      if (!receiverStore) return res.status(404).json({ message: "Receiver store not found" });
  
      const isContactPerson = receiverStore.contactPersons.includes(userId);
      if (!isContactPerson) return res.status(403).json({ message: "Only contact persons of the receiver store can approve/reject transfers" });
  
      if (status === "rejected") {
        transfer.status = "rejected";
        await transfer.save();
        return res.status(200).json({ message: "Transfer rejected", transfer });
      }
  
      if (status !== "approved") {
        return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
      }
  
      // Proceed with approval
      const senderProduct = await Product.findOne({ _id: transfer.product, store: transfer.senderStore }).populate("brand");
      if (!senderProduct || senderProduct.quantity < transfer.quantity) {
        return res.status(400).json({ message: "Insufficient stock in sender store" });
      }
  
      const senderBrand = senderProduct.brand;
      if (!senderBrand) return res.status(404).json({ message: "Sender brand not found" });
  
      newPrice = newPrice || senderBrand.sellingPrice;
  
      // Decrease quantity in sender brand
      let senderBrandDoc = await Brand.findOne({ name: senderBrand.name, store: transfer.senderStore });
      if (!senderBrandDoc) return res.status(400).json({ message: "Sender brand not found in sender store" });
  
      senderBrandDoc.quantity = Math.max(senderBrandDoc.quantity - transfer.quantity, 0);
      await senderBrandDoc.save();
  
      // Check or create brand in receiver store
      let receiverBrand = await Brand.findOne({ name: senderBrand.name, store: transfer.receiverStore });
  
      if (!receiverBrand) {
        receiverBrand = new Brand({
          name: senderBrand.name,
          category: senderBrand.category,
          minStock: minStock !== undefined ? minStock : senderBrand.minStock,
          quantity: transfer.quantity,
          sellingUnit: senderBrand.sellingUnit,
          sellingPrice: newPrice,
          store: transfer.receiverStore,
          entity: receiverStore.entity
        });
        await receiverBrand.save();
      } else {
        receiverBrand.quantity += transfer.quantity;
        if (minStock !== undefined) receiverBrand.minStock = minStock;
        await receiverBrand.save();
      }
  
      // Check or create product in receiver store
      let receiverProduct = await Product.findOne({
        name : senderProduct.name,
        batch: senderProduct.batch,
        store: transfer.receiverStore
      });
  
      if (receiverProduct) {
        receiverProduct.quantity += transfer.quantity;
        await receiverProduct.save();
      } else {
        receiverProduct = new Product({
          name: senderProduct.name,
          buyingPrice: senderProduct.buyingPrice,
          category: senderProduct.category,
          quantity: transfer.quantity,
          purchaseQuantity: 0,
          supplier: senderProduct.supplier,
          expiry_date: senderProduct.expiry_date,
          purchase_invoice: senderProduct.purchase_invoice,
          entity: receiverStore.entity,
          batch: senderProduct.batch,
          store: transfer.receiverStore,
          brand: receiverBrand._id,
        });
        await receiverProduct.save();
      }
  
      // Update sender product quantity
      senderProduct.quantity -= transfer.quantity;
      await senderProduct.save();
  
      // Finalize transfer
      transfer.status = "approved";
      await transfer.save();
      
      // Create new bin card entry for sender 
    const newBinCard = new BinCard({
        itemCode: transfer.product,
        brand: senderBrand.id,
        name: senderProduct.name,
        unitOfMeasure: senderBrand.sellingUnit,
        category: senderBrand.category,
        issuedQuantity: transfer.quantity,
        issuedTo: receiverStore.name,
        receivedQuantity: 0,
        receivedFrom: null,
        batch : senderProduct.batch,
        expiry_date : senderProduct.expiry_date,
        purchase_invoice : senderProduct.purchase_invoice,
        supplier: senderProduct.supplier,
        store: senderProduct.store,
        remark : "Transfered to other store"
      });
  
      const savedBinCard1 = await newBinCard.save();
      
      const senderStore = await Store.findById(senderProduct.store)
      if(!senderStore)
        return res.status(400).json({message : "Reciver store not found "})
      // Create new bin card entry for reciever 
    const newAddBinCard = new BinCard({
        itemCode: receiverProduct._id,
        brand: receiverBrand._id,
        name: receiverProduct.name,
        unitOfMeasure: receiverBrand.sellingUnit,
        category: receiverBrand.category,
        issuedQuantity: 0,
        issuedTo: null,
        receivedQuantity: transfer.quantity,
        receivedFrom: senderStore.name,
        batch : senderProduct.batch,
        expiry_date : senderProduct.expiry_date,
        purchase_invoice : senderProduct.purchase_invoice,
        supplier: senderProduct.supplier,
        store: receiverProduct.store,
        remark : "received from other store"
      });
  
      const savedBinCard2 = await newAddBinCard.save();
  
      res.status(200).json({ message: "Transfer approved and stock updated", transfer });
  
    } catch (error) {
      console.error("Error in transfer approval:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
// Stockout report (Optimized)
router.get('/stockOut', async (req, res) => {
    try {
        // Find products where quantity <= minStock directly in MongoDB (no looping)
        const stockOuts = await Brand.find({ $expr: { $lte: ["$quantity", "$minStock"] } })
        .populate('store' ,"name")
        .populate('entity', 'name');

        // If no stock-outs found
        if (stockOuts.length === 0) {
            return res.status(404).json({ message: "No stock-out products found" });
        }

        res.status(200).json({ stockOuts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// change this in backend (product route)
router.get('/productsbybrand/:id', async (req, res) => {
  try {
    const brandId = req.params.id; // ✅ not req.body.brandId
    if (!brandId) return res.status(400).json({ message: "Brand ID is required" });

    const products = await Product.find({ brand: brandId }).sort({ createdAt: -1 });
    if (!products || products.length === 0)
      return res.status(404).json({ message: "No products found" });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//this is for adding damaged products
router.post('/addDamaged', authenticate, async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const theProduct = await Product.findById(productId);
    if (!theProduct) {
      return res.status(404).json({ message: "The product not found" });
    }

    if (quantity > theProduct.quantity) {
      return res.status(400).json({ message: "Insufficient quantity in stock" });
    }

    const theBrand = await Brand.findById(theProduct.brand);
    if (!theBrand) {
      return res.status(404).json({ message: "The brand not found" });
    }

    // Create BinCard entry
    const newBinCard = new BinCard({
      itemCode: theProduct._id,
      brand: theBrand._id,
      name: theProduct.name,
      unitOfMeasure: theBrand.sellingUnit,
      category: theBrand.category,
      issuedQuantity: quantity,
      issuedTo: "damaged report",
      receivedQuantity: 0,
      receivedFrom: null,
      batch: theProduct.batch,
      expiry_date: theProduct.expiry_date,
      purchase_invoice: theProduct.purchase_invoice,
      supplier: theProduct.supplier,
      store: theProduct.store,
      remark: "Damaged"
    });

    await newBinCard.save();

    theProduct.quantity -= quantity;
    await theProduct.save();

    theBrand.quantity -= quantity;
    await theBrand.save();
    const damagedReport = new DamagedProducts({
      product: theProduct._id,
      quantity,
      reason,
      reportedBy: req.user.id,
      fromStore: theProduct.store,
    });

    await damagedReport.save();

    res.status(200).json(damagedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.post('/listDamagedByStoreAndDate', async (req, res) => {
//   try {
//     const { storeId, date } = req.body;

//     if (!storeId || !date) {
//       return res.status(400).json({ message: "Missing storeId or date" });
//     }

//     const start = new Date(date);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(date);
//     end.setHours(23, 59, 59, 999);

//     const results = await DamagedProducts.find({
//       fromStore: storeId,
//       createdAt: { $gte: start, $lte: end }
//     })
//     .populate('product', 'name')
//     .populate('reportedBy', 'name')
//     .populate('fromStore', 'name')
//     .sort({ createdAt: -1 });

//     res.status(200).json(results);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.post('/listDamagedByStoreAndDate', async (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing startDate or endDate" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const query = {
      createdAt: { $gte: start, $lte: end }
    };

    if (storeId) {
      query.fromStore = storeId;
    }

    const results = await DamagedProducts.find(query)
      .populate('product', 'name')
      .populate('reportedBy', 'name')
      .populate('fromStore', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/productsByAppointedStores', authenticate, async (req, res) => {
  try {
    const user = req.user; // Comes from authenticate middleware
    const storeIds = user.appointedStores;

    if (!storeIds || storeIds.length === 0) {
      return res.status(403).json({ message: "User has no appointed stores" });
    }

    const products = await Product.find({
      store: { $in: storeIds },
      quantity: { $gt: 0 },
    })
      .populate("supplier", "name")
      .populate("entity", "name")
      .populate("brand", "name category quantity sellingPrice") 
      .populate("store", "name")
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found in appointed stores" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});
// this is for the report
router.post('/transferReport', authenticate, async (req, res) => {
  try {
    const { senderStore, receiverStore, startDate, endDate } = req.body;

    const transfers = await TransferHistory.find({
      senderStore,
      receiverStore,
      status: "approved",
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      }
    }).populate("product", "name");

    const totalPrice = transfers.reduce((sum, transfer) => sum + (transfer.price * transfer.quantity), 0);

    res.status(200).json({ totalPrice,transfers });
  } catch (err) {
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
});


module.exports = router;
