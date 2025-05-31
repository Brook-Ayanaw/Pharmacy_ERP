const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        buyingPrice: { type: Number, required: true },
        category: { type: String, required: true }, // Fixed spelling
        quantity: { type: Number, required: true },
        purchaseQuantity : { type: Number, required: true },
        supplier: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Supplier', 
            required: true 
        },
        expiry_date: { type: Date, required: true },
        purchase_invoice: { type: String , default : null, trim : true}, // Fixed spelling
        entity: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entity',
            required: true
        },
        brand : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Brand",
            required : true
        },
        batch: { type: String, required: true },
        store: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store', // Added reference to Store model
            required: true
        }
    }, 
    { timestamps: true }
);



const Product = mongoose.model('Product', productSchema);
module.exports = Product;
