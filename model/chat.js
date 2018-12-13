const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a Model
const messageSchema = new Schema({
    content: String,
    username: String,
    name: String,
    time: String
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;