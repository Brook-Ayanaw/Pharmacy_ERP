const mongoose = require('mongoose');

const deletedSaleHistorySchema = new mongoose.Schema(
    {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true,
            min: [1, "Quantity must be at least 1"]
        },
        reason: { 
            type: String, 
            required: true, 
        }, // Why the sale was deleted
        deletedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        }, // The admin or cashier who deleted the sale
        originalSaleDate: { 
            type: Date, 
            required: true 
        }, // When the sale originally happened
        fromStore : {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Store', 
            required: true
        }
    }, 
    { timestamps: true }
);
deletedSaleHistorySchema.index({ fromStore: 1, originalSaleDate: -1 });
deletedSaleHistorySchema.index({ originalSaleDate: -1 });

const DeletedSalesHistory = mongoose.model('DeletedSalesHistory', deletedSaleHistorySchema);
module.exports = DeletedSalesHistory;
