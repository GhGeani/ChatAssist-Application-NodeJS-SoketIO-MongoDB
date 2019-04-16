const express = require('express');
const socket = require('socket.io');
const ChatBox = require('../Chat-Application-NodeJS-SoketIO/models/chatbox');
const uuid = require('uuid');

let app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/client.html');
});

app.get('/admin-panel', function (req, res) {
    res.sendFile(__dirname + '/views/admin.html');
});

let server = app.listen(3000, function () {
    console.log("Server ON! Port: 3000");
});

let users = [];
let admins = [];

let io = socket(server);



// Namespaces
let user_ns = io.of('/');
let admin_ns = io.of('/admin-panel');


user_ns.on('connection', function (socket) {

    socket.on('new user', function (data) {
        socket.isAdmin = false;
        let newUser = false;
        if (data.isNew) {
            // Creating a random uuid name for socket room
            data.roomID = uuid.v4();
            // -- 
            socket.emit('roomID', data.roomID)
        }
        socket.roomID = data.roomID;
        // Join socket to room
        socket.join(socket.roomID);

        //If user is new add to users array
        if (!users[socket.roomID]) {
            users[socket.roomID] = socket;
            addNewChat(data.roomID);
            newUser = true;
        }

        if (Object.keys(admins).length == 0) { // If there is no admin logged we will emit an 'log message' to announce user 
            user_ns.in(data.roomID).emit('log message', 'Hello! Thanks for using our chat!' +
                'In this moment we dont have available admins. Please, try little bit later');
        } else {
            if (newUser == true) {
                for (socketAdmin in admins) {
                    admin_ns.to(admins[socketAdmin].id).emit('new chat', {
                        chatID: data.roomID
                    });
                }
            }
        }

        // If user open a new tab
        if (!data.isNew) {
            ChatBox.findOne({
                chatID: data.roomID
            }, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    user_ns.to(socket.id).emit('return messages', {
                        messages: result.messages
                    });
                }
            })
        }
    })

    socket.on('new message', function (data) {

        data.id = socket.roomID;

        addMsgToChat(data.id, data.message, data.isAdmin);
        admin_ns.emit('new message', {
            message: data.message,
            id: data.id,
        })
        user_ns.in(data.id).emit('new message', {
            message: data.message,
        })
    })

    socket.on('disconnect', function () {
        delete users[socket.roomID];
        deleteChat(socket.roomID)
        admin_ns.emit('user disconnected', {
            id: socket.roomID
        })
    });

});

// Admin page -- namespace
admin_ns.on('connection', function (socket) {


    socket.on('new message', function (data) {

        addMsgToChat(data.id, data.message, data.isAdmin);

        admin_ns.emit('new message', {
            message: data.message,
            id: data.id,
        });
        user_ns.in(data.id).emit('new message', {
            message: data.message,
        });

    })

    socket.on('admin connected', function (data) {
        socket.isAdmin = true;
        socket.username = data.username;
        admins[data.username] = socket;

        // Check if user is already on chat
        if (Object.keys(users).length > 0) {
            for (let usersocket in users) {
                socket.join(users[usersocket].roomID);

                ChatBox.findOne({
                    chatID: users[usersocket].roomID
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        admin_ns.to(socket.id).emit('new chat', {
                            chatID: users[usersocket].roomID,
                            history: result.messages
                        });
                    }
                });
            }
        }
    });

    socket.on('disconnect', function () {
        delete admins[socket.username];
    })

})


// Save new chat in MongoDB Database
function addNewChat(id) {
    ChatBox.find({
        chatID: id
    }).then(function (result) {
        if (result.length == 0) {
            let newChat = new ChatBox({
                chatID: id,
                messages: []
            });
            newChat.save();
        }
    });
}

// Delete Chat from MongoDB database
function deleteChat(id) {
    ChatBox.findOne({
        chatID: id
    }, function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result != null) {
            ChatBox.deleteOne({
                chatID: id
            }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
}

// Add messages to a chatbox
function addMsgToChat(id, msg, isAdmin) {
    ChatBox.findOne({
        chatID: id
    }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            if (result) {
                result.messages.push({
                    isSendByAdmin: isAdmin,
                    message: msg,
                    index: result.messages.length
                });
                result.save();
            }

        }
    });
}