

class Database {

    constructor() {
        this.requires();
        this.host = this.config.host;
        this.port = this.config.port;
        this.dbName = this.config.dbName;
        this.connect();

    }

    connect() {
        const dbpath = `mongodb://${this.host}:${this.port}/${this.dbName}`;
        this.mongoose.connect(dbpath, {
            useNewUrlParser: true
        });
        this.mongoose.connection.once('open', function () {
            console.log('Connection to database has been made..');
        }).on('error', function (error) {
            console.log(error);
        });
    }

    requires() {
        this.mongoose = require('mongoose');
        this.config = require('./configs/db.config.js');
    }

}

module.exports = Database;