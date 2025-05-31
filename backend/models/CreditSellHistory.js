const mongoose = require('mongoose');

const CreditSaleHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    }, // ✅ Total price for the sale (calculated)
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    }, // ✅ Reference to Patient model for hospital customers
    customerName: {
      type: String,
      trim: true,
      default: null,
    }, // ✅ Name for walk-in customers
    fromStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    creditCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditCustomer',
      required: true,
    },
    paymentStatus : {
        type : String,
        enum : ["paid" , "unpaid"],
        required : true,
        default : "unpaid"
    }
  },
  { timestamps: true }
);

// ✅ Ensure either `patientId` or `customerName` is provided
CreditSaleHistorySchema.pre('save', function (next) {
  if (!this.patientId && !this.customerName) {
    return next(
      new Error("Either 'patientId' or 'customerName' must be provided.")
    );
  }
  next();
});

const CreditSaleHistory = mongoose.model(
  'CreditSaleHistory',
  CreditSaleHistorySchema
);

module.exports = CreditSaleHistory;
