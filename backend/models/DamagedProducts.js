const mongoose = require('mongoose');

const damegedSchema = new mongoose.Schema(
    {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
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
        }, 
        reportedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        }, 
        fromStore : {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Store', 
            required: true
        }
    }, 
    { timestamps: true }
);
damegedSchema.index({ fromStore: 1, createdAt: 1 }); // For listing damage reports by store and date

const DamagedProducts = mongoose.model('DamagedProducts', damegedSchema);
module.exports = DamagedProducts;
