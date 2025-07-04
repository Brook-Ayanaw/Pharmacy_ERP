const mongoose = require('mongoose');

const SaleHistorySchema = new mongoose.Schema(
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
            required: true 
        },
        totalPrice: { 
            type: Number, 
            required: true 
        }, // ✅ Total price for the sale (calculated)
        patientId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Patient', 
            default: null 
        }, // ✅ Reference to Patient model for hospital customers
        customerName: { 
            type: String, 
            trim: true, 
            default: null 
        }, // ✅ Name for walk-in customers
        fromStore : {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Store', 
            required : true
        }
    },
    { timestamps: true }
);
SaleHistorySchema.index({ fromStore: 1, createdAt: -1 });
SaleHistorySchema.index({ createdAt: -1 });
SaleHistorySchema.index({ user: 1 });
SaleHistorySchema.index({ product: 1 });

// ✅ Ensure either `patientId` or `customerName` is provided
SaleHistorySchema.pre('save', function (next) {
    if (!this.patientId && !this.customerName) {
        return next(new Error("Either 'patientId' or 'customerName' must be provided."));
    }
    next();
});

const SaleHistory = mongoose.model('SaleHistory', SaleHistorySchema);
module.exports = SaleHistory;
