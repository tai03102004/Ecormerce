'use strict'

const keyTokenModel = require('../models/keytoken.model');
const {
    Types
} = require('mongoose');
class keyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken
    }) => {
        try {
            const filter = {
                    name: userId
                },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken
                },
                options = {
                    upsert: true,
                    new: true
                }
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({
            name: userId,
        });
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({
            _id: id,
        });
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({
            refreshTokensUsed: refreshToken
        }).lean();;
    }

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.deleteOne({
            name: userId
        });
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({
            refreshToken
        });
    }
}

module.exports = keyTokenService;