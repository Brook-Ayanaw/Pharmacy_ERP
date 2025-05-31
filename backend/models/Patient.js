const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true, 
            trim: true 
        },
        email: { 
            type: String, 
            sparse: true, // Allows multiple null values
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
            trim: true,
            default: null // Explicitly set default to null
        },
        phoneNumber: { 
            type: String, 
            required: true, 
            trim: true,
            match: [/^\d{10,15}$/, "Phone number must be between 10-15 digits"]
        },
        age: { 
            type: Number, 
            required: true, 
            min: [0, "Age cannot be negative"]
        },
        gender: { 
            type: String, 
            enum: ["male", "female"],
            required: true
        },
        creditCustomer: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "CreditCustomer",
            default: null // Ensures null when no credit customer exists
        },
        isCreditCustomer: { 
            type: Boolean, 
            required: true, 
            default: false 
        },
        isActive: { 
            type: Boolean, 
            required: true, 
            default: true // ✅ New field: Soft delete support
        }
    },
    { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
