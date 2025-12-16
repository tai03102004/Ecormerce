'use strict'

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const keyTokenService = require('./keytoken.service');
const KeyToken = require('../models/keytoken.model');
const {
    createTokenPair,
    verifyJWT
} = require('../auth/authUtils');
const roleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

const {
    getInfoData
} = require('../utils/index');
const {
    BadRequestError,
    AuthRequestError,
    ForbiddenError
} = require('../core/error.response');
const {
    findByEmail
} = require('./shop.service');
const emailQueue = require('../queues/email.queue');

class AccessService {
    static signUp = async ({
        name,
        email,
        password
    }) => {
        // step 1: Check email exist
        const holderShop = await shopModel.findOne({
            email
        }).lean();
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await emailQueue.add('sendEmail', {
            email: email,
        })
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [roleShop.SHOP]
        });

        if (newShop) {
            // created privateKey, publicKey
            const {
                privateKey,
                publicKey
            } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki', // pkcs8
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                }
            });

            const publicKeyString = await keyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            })

            if (!publicKeyString) {
                throw new BadRequestError('Error: KeyToken error!');
            }

            // Created token pair
            const tokens = await createTokenPair({
                userId: newShop._id,
                email
            }, publicKey, privateKey);

            return {
                shop: getInfoData({
                    fields: ['_id', 'name', 'email'],
                    object: newShop
                }),
                tokens,
            }
        }
        throw new BadRequestError('Error creating new shop');
    }
    /**
     * 1 - Check email in dbs
     * 2 - match password
     * 3 - Create AT, RT and save
     * 4 - Generate tokens
     * 5 - Get info user return to client
     */
    static login = async ({
        email,
        password,
        refreshToken = null
    }) => {
        // step 1: Check email exist
        const foundShop = await findByEmail({
            email
        });
        if (!foundShop) {
            throw new BadRequestError('Error: Shop not registered!');
        }

        // step 2: match password
        const match = await bcrypt.compare(password, foundShop.password);

        if (!match) {
            throw new AuthRequestError('Error: Authenticator error!');
        }

        // step 3: Create AT, RT and save
        const {
            privateKey,
            publicKey
        } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki', // pkcs8
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            }
        });
        const {
            _id: userId
        } = foundShop;

        // step 4: Generate tokens using keys from keyStore
        const tokens = await createTokenPair({
            userId,
            email
        }, publicKey, privateKey);

        await keyTokenService.createKeyToken({
            userId,
            publicKey: publicKey,
            privateKey: privateKey,
            refreshToken: tokens.refreshToken
        })

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop
            }),
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await keyTokenService.removeKeyById(keyStore._id);
        console.log('Del Key', delKey);
        return delKey;
    }
    /**
     * Check this token used?
     */
    static handlerRefreshToken = async (refreshToken) => {
        const foundToken = await keyTokenService.findByRefreshTokenUsed(refreshToken);
        if (foundToken) {
            // decode refreshToken -> hack
            const {
                userId,
                email
            } = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log('Decode RT', userId, email);
            // Remove all keyToken
            await keyTokenService.deleteKeyById(userId);

            throw new ForbiddenError('Something wrong happen. Please re-login!');
        }

        const holderToken = await keyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) {
            throw new AuthRequestError('Shop not registered!');
        }

        // Verify token
        const {
            userId,
            email
        } = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log('Decode RT', userId, email);
        const foundShop = await findByEmail({
            email
        });
        if (!foundShop) {
            throw new AuthRequestError('Shop not registered!');
        }
        // Create new token
        const tokens = await createTokenPair({
            userId,
            email
        }, holderToken.publicKey, holderToken.privateKey);

        // update token 
        await KeyToken.updateOne({
            _id: holderToken._id
        }, {
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user: {
                userId,
                email
            },
            tokens
        }
    }

    static handlerRefreshTokenV2 = async ({
        refreshToken,
        user,
        keyStore
    }) => {
        const {
            userId,
            email
        } = user;
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await keyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happen. Please re-login!');
        }
        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthRequestError('Shop not registered!');
        }
        // Verify token
        await verifyJWT(refreshToken, keyStore.privateKey);
        const foundShop = await findByEmail({
            email
        });
        if (!foundShop) {
            throw new AuthRequestError('Shop not registered!');
        }

        // Create new token
        const tokens = await createTokenPair({
            userId,
            email
        }, keyStore.publicKey, keyStore.privateKey);
        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user,
            tokens
        }
    }
}

module.exports = AccessService;