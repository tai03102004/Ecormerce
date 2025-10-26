'use strict'

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopDev';

mongoose.connect(uri).then(_ => console.log("MongoDB connected")).catch(err => console.log(err));

if (1 === 0) {
    mongoose.set('debug', true);
    mongoose.set('debug', {
        color: true
    });
}

module.exports = mongoose;