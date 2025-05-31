const mongoose = require("mongoose");

const CreditCustomerSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true, 
            trim: true ,
            unique : true
        },
        email: { 
            type: String, 
            required: true, 
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"] 
        },
        phoneNumber: { 
            type: String, 
            required: true, 
            trim: true,
            match: [/^\d{10,15}$/, "Please enter a valid phone number (10-15 digits)"]
        },
        balance: { 
            type: Number, 
            default: 0    
        },
        isValid : {
            type : Boolean,
            required : true,
            default : true
        }
    },
    { timestamps: true }
);

const CreditCustomer = mongoose.model("CreditCustomer", CreditCustomerSchema);
module.exports = CreditCustomer;
