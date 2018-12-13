const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a Model
const chatUserSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String
});

const chatUser = mongoose.model('chatter', chatUserSchema);

module.exports = chatUser;