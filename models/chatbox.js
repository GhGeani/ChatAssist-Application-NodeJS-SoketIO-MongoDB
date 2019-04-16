let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Connect to mongoDB database
let dbpath = 'mongodb://localhost:27017/chatassistapp';
mongoose.connect(dbpath, {useNewUrlParser: true });
mongoose.connection.once('open', function(){
    console.log('Connection to database has been made..');
}).on('error', function (error) {
    console.log(error);
});

const MessageSchema = new Schema({
    isSendByAdmin: Boolean,
    message: String,
    index: Number
});

const ChatBoxSchema = new Schema({
    chatID: String,
    messages: [MessageSchema]
});

const ChatBox = mongoose.model('chatbox', ChatBoxSchema);

module.exports = ChatBox;