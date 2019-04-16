$(document).ready(function () {

    let socket = io('/admin-panel');

    $('form').submit(function (e) {
        e.preventDefault();
        let adminUsername = $('#username').val();
        $('#username').val('');
        $('.admin-form').hide();
        $('.users-container').show();


        socket.emit('admin connected', {
            username: adminUsername,
            id: socket.id
        })
    });

    socket.on('new chat', function (data) {
        $('.users-container').append(createChatBox(data.chatID));
        let message = $('#' + data.chatID);
        let chatbox = message.parent();
        let button = chatbox.children('button');

        if (data.history != []) {
            for (msg in data.history) {
                chatbox.children('.chat-body').append('<p class = "message">' + data.history[msg].message + '</p>');
            }
        }
        $(button).click(function (e) {
            e.preventDefault();
            let message = $('#' + data.chatID).val();
            $('#' + data.chatID).val('');

            socket.emit('new message', {
                message: message,
                id: data.chatID,
                isAdmin: true,
            });

        });
    });

    socket.on('new message', function (data) {

        let message = $('#' + data.id);
        let parentChatbox = message.parent();
        parentChatbox.children('.chat-body').append('<p class = "message">' + data.message + '</p>');

    });

    socket.on('user disconnected', function (data) {

        // When user disconnect we must delete his chatbox from /admin-panel

        let message = $('#' + data.id);
        let parentChatbox = message.parent();
        parentChatbox.remove();

    })

    function createChatBox(id) {
        return ("<div class = 'chatbox'><div class= 'chat-header'>ChatID: #" + id +
            "</div><div class = 'chat-body'></div><input type = 'text' class = 'msg' id='" + id +
            "'/><button class = 'btn btn-secondary btn-block btn-sm'>Send message</button></div>")
    }
});