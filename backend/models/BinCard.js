const mongoose = require('mongoose');

const binCardSchema = new mongoose.Schema(
  {
    itemCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unitOfMeasure: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: null,
    },

    issuedQuantity: {
      type: Number,
      default: 0,
    },
    issuedTo: {
      type: String,
      default: null,
    },
    receivedQuantity: {
      type: Number,
      default: 0,
    },
    receivedFrom: {
      type: String,
      default: null,
    },
    batch: {
      type: String,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    purchase_invoice: {
      type: String,
      default: null,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    remark: {
      type: String,
      trim: true,
      default: null
    }
  },
  { timestamps: true }
);

const BinCard = mongoose.model('BinCard', binCardSchema);
module.exports = BinCard;
