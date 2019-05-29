class Server {

    constructor() {
        this.requires();
        this.port = this.config.port;
        this.app = this.express();
        this.startServer();
        this.db = new this.Database();
    }

    requires() {
        this.path = require('path');
        this.express = require('express'); 
        this.userController = require('../controller/user.controller.js');
        this.adminController = require('../controller/admin.controller.js');
        this.config = require('./configs/server.config.js');
        this.Database = require('./Database');
    }

    startServer() {
        this.middleware();
        this.server = this.app.listen(this.port, () => {
                console.log(`Server running on port ${this.port}`);
        })
    }

    middleware() {
        this.app.use(this.express.static(this.path.join(__dirname + '/../public')));
        this.app.use('/h', this.userController);
        this.app.use('/admin-panel', this.adminController);
        this.app.get('/',(req,res) => res.redirect('/h'));
    }
}

module.exports = Server;