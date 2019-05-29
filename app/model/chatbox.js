let mongoose = require('mongoose');
let Schema = mongoose.Schema;


const MessageSchema = new Schema({
    sender: [{
        isAdmin: Boolean,
        name: String,
        roomID: String
    }],
    message: String,
    date: String
});


const ChatBoxSchema = new Schema({
    chatID: String,
    messages: [MessageSchema]
});


let message = mongoose.model('message', MessageSchema);
module.exports = ChatBox = mongoose.model('chatbox', ChatBoxSchema);


module.exports.deleteChat = function(id){
    ChatBox.findOneAndRemove({chatID: id })
    .then((response)=>{
        console.log(response)
    })
    .catch((err) =>{
        console.log(err);
    })
}

module.exports.addMsgToChat = function (id, sender, message, date) { 
    ChatBox.findOne({chatID: id}).then((result) => {
        if(result){
            result.messages.push({
                sender: sender,
                message: message,
                date: date
            });
            result.save();
        }
    })
}

module.exports.createChatBox = function (id) {  
    ChatBox.find({chatID: id}).then((result) => {
        if(result.length == 0){
            let newChat = new ChatBox({
                chatID: id,
                messages: []
            });
            newChat.save();
        }
    })
}