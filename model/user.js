// db.js
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://kousallya:FatorkKDpivaKISi@cluster0.sql4ele.mongodb.net/chat-app?retryWrites=true&w=majority');

const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  password: String,
});

module.exports = mongoose.model('User', userSchema);
