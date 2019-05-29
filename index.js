const Server = require('./app/classes/Server.js');
const socket = require('socket.io');
//const sk_conn = require('./app/sockets/socket.connection');
const uuid = require('uuid');
const user = require('./app/model/user.js');
const admin = require('./app/model/admin.js');
const chat = require('./app/model/chatbox.js');

let Serverpassword = uuid.v4().slice(0,5);
console.log('Password: ' + Serverpassword);

module.exports = app = new Server();

let io = socket(app.server);

 // Namespaces
 let user_ns = io.of('/h');
 let admin_ns = io.of('/admin-panel');
 

 user_ns.on('connection', function(socket){
    console.log('Socket connected on path /h');


    socket.on('user_connected', function(data){
        console.log('user_connected');

        

        if(data.isNewUser == true) {
             /* Creating a random uuid for socket room */
            socket.roomID = uuid.v4();
            var usr = new user({isAdmin: false, name: data.name, roomID: socket.roomID});
            usr.save();
            socket.usr = usr;
            console.log(socket.usr);
            socket.emit('roomID', socket.usr.roomID);
            chat.createChatBox(socket.roomID);
            socket.join(socket.roomID);

            admin.find({}).then((result) => {
                if(result.length != 0){
                    console.log('Am trimis eveniment catre toti adminii.');
                    for(let admin in result){
                        socket.join(result[admin].roomID);
                        admin_ns.to(result[admin].roomID).emit('new_user',{
                            name: socket.usr.name,
                            roomID: socket.usr.roomID,
                        });
                    }
                } else {
                    /* Notidy user there are no admins online */
                    user_ns.emit('notify', 'Hello, there are not admins online. Wait few moments..')
                }
            });
            

           
        } else {
            socket.usr = {
                isAdmin: false,
                name: data.name,
                roomID: data.roomID,
            };
            socket.join(socket.usr.roomID);
            console.log("Socket already connected");
            console.log(socket.usr);
            /* this will be exec when user isn't a new one  */
            chat.findOne({chatID: socket.usr.roomID}).then((result) => {
                if (result) {
                console.log(result);
                    socket.emit('get_messages', {history: result.messages});
                }
            })

        }

       
        
    });

    socket.on('send_message', function(data){
        console.log(data);
        console.log(socket.usr.roomID);

        chat.addMsgToChat(socket.usr.roomID, socket.usr, data.message, data.date);

        user_ns.in(socket.usr.roomID).emit('send_message', {
            sender: socket.usr,
            message: data.message,
            date: data.date
        })

        admin_ns.emit('send_message', {
            sender: socket.usr,
            message: data.message,
            date: data.date,
            roomID: socket.usr.roomID
        });

    });
});


admin_ns.on('connection', function (socket) {
    console.log('socket connected on path /admin-panel');
    var roomID;

    socket.on('admin_connected', function(data){
        /* When admin connect he need to join in user room  */
        console.log('admin_connected');
        user_ns.emit('remove_notify');

        if(data.password != Serverpassword) {
            socket.emit('error_login', {err: true});
        } else {
            socket.emit('error_login', {err: false});
            /* Create an admin */
            socket.roomID = uuid.v4();
            socket.join(socket.roomID);
            var adm = new admin({isAdmin: true, name: data.name, roomID: socket.roomID});
            adm.save(); 
            socket.adm = adm;
            socket.emit('roomID', {roomID: socket.adm.roomID});

            console.log(socket.adm);

            admin_ns.emit('admin_connected', {name: socket.adm.name, roomID: socket.adm.roomID});

            /* If some admin are already conn */
            admin.find({}).then((result) => {
                if(result.length != 0){
                    socket.emit('get_admins', result)
                }
            })


            /* Check if there are active clients */
            user.find({}).then((result) => {
                if(result.length != 0){
                    console.log('Active cliets found, joining in their rooms ');
                    for(let user in result){
                    console.log(result[user].roomID);
                    socket.join(result[user].roomID);
                    admin_ns.in(socket.adm.roomID).emit('new_user', {name: result[user].name, roomID: result[user].roomID});
                    }
                }
            });

            socket.on('show_chat', function (data) { 
                roomID = data.roomID;
                console.log('Chatbox selectat: ' + data.roomID);
                chat.findOne({chatID: roomID}).then((result) =>{
                    if(result.length != 0) {
                        admin_ns.to(socket.roomID).emit('show_chat', {roomID: data.roomID, history: result.messages, name: data.name});
                    }
                });

 });

        }

        
       
        
    })

    socket.on('finish_conversation', function (data) { 
        console.log(data);
        user.deleteUser(data.roomID);
        chat.deleteChat(data.roomID);
        admin_ns.emit('finish_conversation', data);
        user_ns.in(data.roomID).emit('finish_conversation', data);
    })

    socket.on('local_chat_message', function(message){
        admin_ns.emit('local_chat_message', {name: socket.adm.name, message: message});
    });


    socket.on('send_message', function(data){
        console.log(data);
        chat.addMsgToChat(roomID, socket.adm, data.message, data.date);
        user_ns.in(roomID).emit('send_message', {
            sender: socket.adm,
            message: data.message,
            date: data.date
        })
        admin_ns.in(socket.roomID).emit('send_message', {
            sender: socket.adm,
            message: data.message,
            date: data.date,
            roomID: roomID
        })
    });

    socket.on('disconnect', function(){
        if(socket.adm != undefined) {
            admin.findOne({roomID: socket.adm.roomID}).then((result) => {
                if(result){
                    console.log(result);
                    admin_ns.emit('admin_disconnect', {name: socket.adm.name, roomID: socket.adm.roomID});
                    admin.deleteAdmin(socket.adm.roomID);
                }
            })
        }
    });
})

