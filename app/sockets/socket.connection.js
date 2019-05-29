


module.exports.conn = function (socket) { 
    console.log('Socket connected');
    socket.on('user_connected', function(data){
        console.log('user_connected');


        if(data.isNewUser == true) {
             /* Creating a random uuid for socket room */
            socket.roomID = uuid.v4();
            user.createUser(false, data.name, socket.roomID);
            /*  socket.emit('roomID', usr.roomID); */
            chat.createChatBox(socket.roomID);
            socket.join(user.roomID);
            
            /* admin.find().then((result)=>{
                console.log(result);
        
            }) */

        }
    });

    socket.on('send_message', function(data){
        console.log(data);
        chat.addMsgToChat(socket.roomID, data.message, data.isAdmin, data.date, data.from);
        socket.to(socket.roomID).emit('send_message', {
            from: data.from,
            isAdmin: data.isAdmin,
            message: data.message,
            date: data.date
        })
    });


    socket.on('admin_connected', function(data){
        console.log('admin_connected');
        socket.roomID = uuid.v4(data.roomID);
        admin.createAdmin(true, data.name, socket.roomID);
        user.find().then((results)=>{
            /* If are users already active we must join  */
            if(results != null){
                for(let user in results){
                socket.join(results[user].roomID);
                chat.findOne({
                    chatID: results[user].roomID
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.in(socket.roomID).emit('new_chat', {
                            roomID: results[user].roomID,
                            history: results.messages
                        });
                    }
                });
                }
            }
        })
    })
}