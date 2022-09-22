const mongoose = require('mongoose');
const User = require('../model/user');

const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId, 
        ref: User
    },
    inv_name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    date_aq: {
        type: Date,
        require: true,
    },
    approx_v: {
        type : Number
    },
    insurance_v: {
        type: Number
    },
    photo: {
        type: String
    }
});

const Inventory = mongoose.model("inventory", inventorySchema);

module.exports = Inventory;