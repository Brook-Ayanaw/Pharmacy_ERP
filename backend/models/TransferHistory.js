const mongoose = require('mongoose');
const Store = require('./Store');

const transferHistorySchema = new mongoose.Schema(
    {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        senderStore: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        receiverStore: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        quantity: { 
            type: Number, 
            required: true, 
            min: [1, "Quantity must be at least 1"]
        },
        price: { 
            type: Number, 
            required: true, 
            min: [0, "Price cannot be negative"], 
            default: 0 
        },
        batch: { 
            type: String, 
            required: true 
        }, // Ensures batch tracking
        status: { 
            type: String, 
            enum: ["pending", "approved", "rejected"], 
            default: "pending" 
        } // Approval system
    }, 
    { timestamps: true }
);

transferHistorySchema.pre("save", async function (next) {
    try {
        if (this.senderStore.toString() === this.receiverStore.toString()) {
            return next(new Error("Sender and receiver stores cannot be the same."));
        }

        const senderExists = await Store.exists({ _id: this.senderStore });
        const receiverExists = await Store.exists({ _id: this.receiverStore });

        if (!senderExists) return next(new Error("Sender store does not exist."));
        if (!receiverExists) return next(new Error("Receiver store does not exist."));

        next();
    } catch (error) {
        next(error);
    }
});
transferHistorySchema.index({ senderStore: 1, receiverStore: 1, createdAt: 1 }); // For transfer reports
//transferHistorySchema.index({ product: 1 }); // Optional, if filtering transfers per product

const TransferHistory = mongoose.model('TransferHistory', transferHistorySchema);
module.exports = TransferHistory;
