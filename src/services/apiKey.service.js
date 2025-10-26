'use strict'

const apiKeyModel = require('../models/apiKey.model');
const crypto = require('crypto');
const findById = async (key) => {
    // const newKey = await apiKeyModel.create({
    //     key: crypto.randomBytes(16).toString('hex'),
    //     name: 'test',
    //     permissions: ['0000']
    // })
    // console.log('New key: ', newKey);
    const objKey = await apiKeyModel.findOne({
        key,
        status: true
    }).lean();
    return objKey;
}

module.exports = {
    findById
};