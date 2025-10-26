'use strict'

const mongoose = require('mongoose');
const config = require('../configs/config.mongo');
const uri = process.env.MONGODB_URI || `mongodb://${config.db.host}:${config.db.post}/${config.db.name}`;
const {
    countConnects
} = require('../helpers/check.connect');

class Database {
    constructor() {
        this.connect();
    }

    // connect
    connect(type = 'mongoDB') {
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', {
                color: true
            });
        }
        mongoose.connect(uri, {
            maxPoolSize: 20
        }).then(_ => console.log("MongoDB connected", countConnects())).catch(err => console.log(err));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongoDB = Database.getInstance();
module.exports = instanceMongoDB;