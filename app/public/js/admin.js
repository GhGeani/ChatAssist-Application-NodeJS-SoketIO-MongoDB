$(document).ready(function () {
    (function(){
        let socket = io('/admin-panel');
        let adminPage = {
            init: function(){
              this.cacheDom();
              this.bindEvents();
              this.socketEvents();
              this.render();

            },
            cacheDom: function(){
              this.$admin_form = $('.admin-form');
              this.$input_name = this.$admin_form.find('.input-name');
              this.$input_password = this.$admin_form.find('.input-password');
              this.$container_fluid = $('.container-fluid');
              this.$users_container = this.$container_fluid.find('.users-container');
              this.$usersList = this.$users_container.children('tbody');
              this.$selected_chat = $('.selected-chat');
              this.$adminsTsble = this.$container_fluid.find('.admins');
              this.$adminsList = this.$adminsTsble.children('.admins-list')
              this.$right_panel = this.$container_fluid.find('.right-panel');
              this.$chatbox_admin = this.$right_panel.children('.chatbox-adm');
              this.$chatbody_admin = this.$chatbox_admin.find('.chat-body-adm');
              this.$form_chat_adm = this.$chatbox_admin.children('form')
              this.$input_chat_adm = this.$form_chat_adm.children('.input-chat-adm');

            },
            bindEvents: function(){
              this.$admin_form.on('submit', this.submitedForm.bind(this));
              this.$form_chat_adm.on('submit', this.submitedMessage.bind(this));

            },
            render: function(){
              socket.on('local_chat_message', this.printMessage.bind(this));
                
            },

            printMessage: function (data) { 
                console.log(data);
                this.$chatbody_admin.append('<li><div class = "who">'+ data.name + '</div><div class = "message"> ' + data.message +'</div></li>');
            },

            socketEvents: function () { 
              socket.on('show_chat', this.showSelectedChat.bind(this));
              socket.on('send_message', this.receiveMessage.bind(this));
              socket.on('new_user', this.emitNewUser.bind(this));
              socket.on('get_admins', this.getAdmins.bind(this));   
              socket.on('admin_disconnect', this.adminDisconnect.bind(this));   
              socket.on('finish_conversation', this.finishConv.bind(this));
              socket.on('error_login', this.loginError.bind(this));
            },
            
            loginError: function(data){
                console.log(data);
                if(data.err == true) {
                    location.reload();
                } else {
                    if(data.err == false){
                        this.$input_name.val('');
                        this.$admin_form.hide();
                        this.$container_fluid.show();
                    }
                }
            },

            finishConv: function(data){
                let $show_button = $('.' + data.roomID);
                let $td = $show_button.parent();
                $td.parent().remove(); // ???
                    $('.chat-body-adm').append('<li class = "user-notify"><i class="material-icons">check_box</i> Conversation with '+data.name+' ended. </li>');
                    $('.selected-chat').empty();
            },

            submitedMessage: function(e){
                e.preventDefault();
                let message = this.$input_chat_adm.val().trim();
                if(message != ''){
                    socket.emit('local_chat_message', message);
                    this.$input_chat_adm.val('');
                } else {
                    this.$input_chat_adm.val('');
                }
               
                
            },

            adminConnected: function (data) { 
                console.log('new admin');
                console.log(data);
                this.$adminsList.append('<tr class = "'+data.roomID+'"><td>' + data.name + '</td></tr>');
                this.$chatbody_admin.append('<li class = "event"><i class="material-icons">person_add</i>  <strong>' + data.name + '</strong> just connected.</li>')
            },

            adminDisconnect: function (data) { 
                $('.'+data.roomID).remove();
                this.$chatbody_admin.append('<li class = "event"><i class="material-icons">exposure_neg_1</i>  <strong>' + data.name + '</strong> disconnected..</li>')
                //socket.emit('disconnect_event', {roomID: data.roomID});
            },

            getAdmins: function (data) { 
                console.log('Old admins found');
                console.log(data);
                if(data.length != 0) {
                    for(let admin in data){
                        this.$adminsList.append('<tr class = "'+data[admin].roomID+'"><td>' + data[admin].name + '</td></tr>');
                    }
                }
            },

            emitNewUser: function (data) { 
                socket.emit('new_user', {name: data.name, roomID: data.roomID});
            },

            showSelectedChat: function(data){
                console.log(data);
                if(this.$selected_chat.length){
                    this.$selected_chat.empty();
                }
                this.$selected_chat.append(this.createChat(data.roomID, data.name));
                this.$input = $('#'+data.roomID);
                this.$form = this.$input.parent();
                this.$chat = this.$form.parent().parent();
                this.$chatbody = this.$chat.children('ul');
                this.$chat_header = this.$chat.children('.chat-header');
                this.$hide_chat = this.$chat_header.children('.hide-chat');
                if(data.history.length != 0){
                    for(let msg in data.history){
                        let who;
                        if(data.history[msg].sender[0].isAdmin) {
                            who = "admin";
                            this.$chatbody.append('<li class = "' + who + '">' + '<div class = "me">'+data.history[msg].sender[0].name   +'</div> '+ data.history[msg].message + '<div class = "date"> -postat ' + data.history[msg].date + '</div></li>')
                        } else {
                            who = "user";
                            this.$chatbody.append('<li class = "' + who + '">' + '<div class = "you">' +data.history[msg].sender[0].name +  '</div> '+ data.history[msg].message + '<div class = "date"> -postat ' + data.history[msg].date + '</div></li>')
                        }
                    }
                }
                this.$form.on('submit', this.sendMessage.bind(this));
                this.$hide_chat.on('click', this.hideChat.bind(this));
                
            },

            receiveMessage: function(data){
                let sender = data.sender;
                let input = $('#' + data.roomID);
                let parentChatbox = input.parent().parent().parent();
                console.log(data);
                if(sender.isAdmin){
                    parentChatbox.children('ul').append('<li class = "admin">' + '<div class = "me">ME</div> '+ data.message + '<div class = "date"> -postat  ' +data.date + '</div></li>');
                } else {
                    parentChatbox.children('ul').append('<li class = "user">' + '<div class = "you">' + data.sender.name +  '</div>'+ data.message + '<div class = "date"> -postat ' +data.date + '</div></li>')
                }
            },

            sendMessage: function (e) {
                e.preventDefault();
                if(this.$input.val().trim() != ''){
                    let date = new Date();
                    let h = date.getHours();
                    let m = date.getMinutes();
                    let sendDate = h+':'+m
                    socket.emit('send_message', {
                        from: 'ADMIN',
                        isAdmin: true,
                        message: this.$input.val().trim(),
                        date: sendDate,
                    });
                    this.$input.val('');
                  } else {
                    this.$input.val('')
                  }
              },

            hideChat: function () { 
                this.$chat.fadeToggle("fast");
            },

            createChat: function(id, name){
                return ('<div class="chatbox"><div class="chat-header"><p>' + name + '</p><i class="material-icons btn btn-danger hide-chat">close</i><form><input class="form-control" type="text" id="' + id + '" placeholder="Type message and press enter" /></form></div><ul></ul></div>');
            },

            submitedForm: function (e) { 
                e.preventDefault();
                socket.emit('admin_connected', {name: this.$input_name.val().trim(), password: this.$input_password.val()});
               
                
                socket.on('admin_connected', this.adminConnected.bind(this));
                socket.on('new_user', this.addRowTable.bind(this));

            },
            addRowTable: function(data){
                /* We must create a new row in users table for each newcomer */
                this.$usersList.append('<tr><td>' + data.name  + '</td><td><button type="button" class="' + data.roomID + ' btn btn-info btn-sm"><i class="material-icons">message</i></button><button type="button" class="btn btn-danger btn-sm block-btn"><i class="material-icons">block</i></button></td><tr>')
                $('.' + data.roomID).on('click', function(){
                    socket.emit('show_chat',{roomID: data.roomID, name: data.name});
                });
                this.$chatbody_admin.append('<li class = "user-notify"><i class="material-icons">notifications</i>  '+data.name+' need help! Check left panel! </li>');
                
                let $show_button = $('.' + data.roomID);
                let $td = $show_button.parent();
                let $block_button = $td.children('.block-btn');
                $block_button.on('click', function(){
                    socket.emit('finish_conversation', {roomID: data.roomID, name: data.name});
                });
            },

         

        }

        adminPage.init();

    })();
});