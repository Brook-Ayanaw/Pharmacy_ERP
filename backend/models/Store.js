const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true
         }, // Follow camelCase naming convention
        contactPersons: [{ // Use plural name since it's an array
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        entity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entity',
            required: true
        }
    }, 
    { timestamps: true }
);

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
