const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        phone_numbers: {
            type: [String],
            validate: {
                validator: function (numbers) {
                    return numbers.every(num => /^\d{10,15}$/.test(num));
                },
                message: 'Each phone number must be 10 to 15 digits long'
            }
        },
        account_numbers: { 
            type: [String],
            default: [], // Ensures it's an array even if not provided
            set: function (numbers) { return [...new Set(numbers)]; } // Removes duplicates
        },
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
            unique: true, // Ensures email is unique
            lowercase: true, // Converts email to lowercase before saving
            trim: true,
            required : true
        }
    }, 
    { timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
