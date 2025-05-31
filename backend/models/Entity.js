const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        phoneNumbers: { 
            type: [String], 
            required: true, 
            trim: true,
            validate: {
                validator: function (arr) {
                    return arr.length > 0; // Ensures at least one phone number is provided
                },
                message: "At least one phone number is required."
            }
        },
        address: { type: String, required: true, trim: true },
        accountNumbers: { 
            type: [String], 
            required: true, 
            trim: true,
            default: []
        }
    }, 
    { timestamps: true }
);

const Entity = mongoose.model('Entity', entitySchema);
module.exports = Entity;
