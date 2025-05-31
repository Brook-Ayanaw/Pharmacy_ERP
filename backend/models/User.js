const mongoose = require("mongoose");
//const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"], 
            trim: true 
        },
        phone_number: { 
            type: String, 
            required: true, 
            unique: true, 
            match: [/^\d{10,15}$/, "Phone number must be between 10-15 digits"], 
            trim: true
        },
        password: { type: String, required: true },
        role: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Role"
            }
        ],
        blockStatus: { 
            type: String, 
            enum: ["ok", "block"], 
            default: "ok", 
            required: true
        },
        appointedStore : [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Store"
        }]
    }, 
    { timestamps: true }
);

// ✅ Ensure unique roles per user
userSchema.path("role").validate(function (value) {
    return Array.isArray(value) && new Set(value.map(String)).size === value.length;
}, "Duplicate roles are not allowed for the same user");

// // ✅ Hash password before saving (Security Fix)
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
    
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         return next(error);
//     }
// });

const User = mongoose.model("User", userSchema);
module.exports = User;
