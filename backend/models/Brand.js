const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true },
        minStock: { type: Number, required : true, default: -1 },
        quantity : {type :Number, required : true, default: 0},
        sellingUnit : {
            type : String,
            enum : ["Pcs", "Vials", "Amp", "Tab", "Pk", "Boxes","Str"]
        },
        sellingPrice : {
            type : Number,
            required : true
        },
        store: { 
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Store', // Added reference to Store model
                    required: true
                },
        entity : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Entity',
            required : true
        }
    }, 
    { timestamps: true }
);

brandSchema.index({ store: 1 }); // For per-store brand listings
brandSchema.index({ name: 1, store: 1 }); // For checking if brand exists in receiver store during transfer


const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
