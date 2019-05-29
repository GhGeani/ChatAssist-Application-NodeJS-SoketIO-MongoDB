
$(document).ready(function () {
    (function(){

        let chatbox = {
            name: 'User#' + Math.floor(Math.random() * 9000),
            init: function(){
              this.socket = io('/h');
              this.id = localStorage.getItem('roomID');
              this.sessionActive = sessionStorage.getItem('active');
              this.cacheDom();
              this.bindEvents();
              this.socketEvents();
              this.render();

            },
            cacheDom: function(){
              this.$open_chat = $('.open-chat');
              this.$chatbox = $('.chatbox');
              this.$hide_chat = this.$chatbox.find('.hide-chat');
              this.$input = this.$chatbox.find('.input');
              this.$chat_body = this.$chatbox.find('.chat-body');
              this.$form = this.$chatbox.find('form');
            },
            bindEvents: function(){
              this.$open_chat.on('click', this.openChat.bind(this));
              this.$hide_chat.on('click', this.hideChat.bind(chatbox));
              this.$form.on('submit', this.addMessage.bind(this));
            },
            render: function(){
              this.socket.on('send_message', this.printMessage.bind(this));
            },

            printMessage: function (data) { 
              console.log(data);
              let sender;
              if(data.sender.isAdmin){
                sender = 'admin';
                $('.chat-body').append('<li class= "'+sender+'"><div class = "you"><i class="material-icons">person_pin</i> '+ data.sender.name +'</div> ' + data.message + '<div class = "date"> -postat' + data.date + '</div>' + '</li>');
              } else {
                sender = 'user';
                $('.chat-body').append('<li class= "'+sender+'">'+ '<div class = "me">ME <i class="material-icons">person_pin</i></div>' + data.message + '<div class = "date"> -postat' + data.date + '</div>' + '</li>');
              }
            },
            openChat: function() {
              this.$open_chat.fadeToggle("fast");
              this.$chatbox.fadeToggle();
              if(this.id == null){
                console.log(this.id);
                this.socket.emit('user_connected', {
                    isNewUser: true,
                    name: this.name,
                })

              } else {
                /* Use open an new tab and press first time on "need help" */
                if((this.id != null && !this.sessionActive) || (this.id && this.sessionActive)){
                  this.socket.emit('user_connected',{
                    isNewUser: false,
                    name: this.name,
                    roomID: this.id,
                    isAdmin: false,
                  })
                  this.socket.emit('get_messages', this.id);
                }
              }
              sessionStorage.setItem('active', true);
              this.sessionActive = true;
            },

            hideChat: function(){
              this.$open_chat.fadeToggle();
              this.$chatbox.fadeToggle('fast');
              this.$chat_body.empty();
            },
            addMessage: function(e){
              e.preventDefault();
              if(this.$input.val().trim() != ''){
                let date = new Date();
                let h = date.getHours();
                let m = date.getMinutes();
                let sendDate = h+':'+m
                this.sendMessage('User.', false, this.$input.val(), sendDate);
                this.$input.val('');
              } else {
                this.$input.val('')
              }
            },
            sendMessage: function (user, isAdmin, message, sendDate) { 
              this.socket.emit('send_message', {
                from: user,
                isAdmin: isAdmin,
                message: message,
                date: sendDate
              })
            },
            socketEvents: function () { 
              this.socket.on('roomID', this.getRoomID.bind(this));
              this.socket.on('get_messages', this.getMessages.bind(this));
              this.socket.on('finish_conversation', this.removeConv.bind(this));
              this.socket.on('notify', this.notifyUser.bind(this));
              this.socket.on('remove_notify', this.removeNotify.bind(this));
             },

             removeNotify: function (data) { 
              this.$chat_body.children('.notify').fadeToggle('slow');  
             },
             
             notifyUser: function (text) { 
               this.$chat_body.append('<li class= "text-muted text-center font-italic notify">' + text + '</li>')
             },

          

             getRoomID: function (roomID) { 
              this.id = roomID;
              localStorage.setItem('roomID', roomID);
             },

            removeConv: function (data) { 
              localStorage.removeItem('roomID');
              this.id = localStorage.getItem('roomID');
              sessionStorage.removeItem('active');
              this.$chatbox.fadeToggle('fast');
              this.$open_chat.fadeToggle('slow');
              this.$chat_body.empty();
            },
             
             getMessages: function(data){
              if(data.history.length != 0){
                for(let msg in data.history){
                    let who;
                    if(data.history[msg].sender[0].isAdmin) {
                        who = "admin";
                        $('.chat-body').append('<li class= "message '+who+'"><div class = "you"><i class="material-icons">person_pin</i> '+ data.history[msg].sender[0].name +'</div> ' + data.history[msg].message + '<div class = "date"> -postat ' + data.history[msg].date + '</div>' + '</li>');
                    } else {
                        who = "user";
                        $('.chat-body').append('<li class= "message '+who+'"><div class = "me">ME <i class="material-icons">person_pin</i></div>' + data.history[msg].message + '<div class = "date"> -postat ' + data.history[msg].date + '</div>' + '</li>');
                    }
                }
            }
             },
        }

        chatbox.init();

    })();
});