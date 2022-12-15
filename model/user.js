const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    F_name: {
        type: String,
        require: true,
        unique: true
    },
    L_name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    role:{
        type: String,
        required: true
    },
    password: {
        type : String,
        require: true
    }
});

const User = mongoose.model("users", userSchema);

module.exports = User;