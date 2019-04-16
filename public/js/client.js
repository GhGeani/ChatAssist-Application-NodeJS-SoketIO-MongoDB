$(document).ready(function () {

    let socket = io('/');

    let id = localStorage.getItem('roomID');
    let sessionActive = sessionStorage.getItem('active');

    

    $('#needHelpBtn').click(function () {
        $('#needHelpBtn').hide();
        $('.chatbox').show();
        sessionStorage.setItem('active', true);
        sessionActive = true;
        if (id && sessionActive) {
            socket.emit('new user', {
                roomID: id,
                isNew: false
            });
        } else {
            socket.emit('new user', {
                isNew: true
            });
        }
        if (id && sessionActive) {
            socket.on('return messages', function (data) {
                if(data.messages) {}
                for (let msg in data.messages) {
                    printMessage(data.messages[msg].message);
                }
            });
        }
    })

    $('form').submit(function (e) {
        e.preventDefault();
        sendMessage();
    });

    socket.on('roomID', function (roomID) {
        id = roomID;
        localStorage.setItem('roomID', roomID);
    });

    socket.on('new message', function (data) {
        printMessage(data.message);
    });



    socket.on('log message', function (data) {
        printMessage(data);
    });

    function sendMessage() {
        let question = $('#question').val();

        if (question) {
            $('#question').val('');
            // Send to server-side the new user infos
            

            socket.emit('new message', {
                message: question,
                isAdmin: false,
            })
        }
    }



    function printMessage(text) {
        $('.chat-body').append('<p class = "message">' + text + '</p>');
    }


    $('#hideBtn').click(function (e) {
        e.preventDefault();
        $('#needHelpBtn').show();
        $('.chatbox').hide();
    });

});