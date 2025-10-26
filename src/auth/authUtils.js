'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const {
    AuthRequestError,
    NotFoundError
} = require('../core/error.response');
const keyTokenService = require('../services/keytoken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rf-token'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log(`[ERROR]::`, err);
            } else {
                console.log(`Decode::`, decode);
            }
        })

        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        return error;
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    console.log('Authentication here');
    /**
     * 1 - Check userId missing
     * 2 - Get accessToken
     * 3 - Verify token
     * 4 - Check user in dbs
     * 5 - Check keyStore with userId
     * 6 - OK all pass -> next()
     */

    // step 1 - check userId missing
    const usedId = req.headers[HEADER.CLIENT_ID];
    if (!usedId) {
        throw new AuthRequestError('Invalid request');
    }
    // step 2 - get accessToken
    const keyStore = await keyTokenService.findByUserId(usedId);
    if (!keyStore) {
        throw new NotFoundError('Not found keyStore');
    }

    // step 3 - verify token
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthRequestError('Invalid request');
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (usedId !== decodeUser.userId) {
            throw new AuthRequestError('Invalid user');
        }
        req.keyStore = keyStore;
        req.user = decodeUser;
        return next();
    } catch (error) {
        throw error;
    }

})

const authenticationV2 = asyncHandler(async (req, res, next) => {
    console.log('Authentication here');
    /**
     * 1 - Check userId missing
     * 2 - Get accessToken
     * 3 - Verify token
     * 4 - Check user in dbs
     * 5 - Check keyStore with userId
     * 6 - OK all pass -> next()
     */

    // step 1 - check userId missing
    const usedId = req.headers[HEADER.CLIENT_ID];
    if (!usedId) {
        throw new AuthRequestError('Invalid request');
    }
    // step 2 - get accessToken
    const keyStore = await keyTokenService.findByUserId(usedId);
    if (!keyStore) {
        throw new NotFoundError('Not found keyStore');
    }

    const refreshToken = req.headers[HEADER.REFRESHTOKEN];
    if (refreshToken) {
        try {
            const decodeUser = JWT.verify(refreshToken, keyStore.publicKey);
            if (usedId !== decodeUser.userId) {
                throw new AuthRequestError('Invalid user');
            }
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }

    // step 3 - verify token
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthRequestError('Invalid request');
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (usedId !== decodeUser.userId) {
            throw new AuthRequestError('Invalid user');
        }
        req.keyStore = keyStore;
        req.user = decodeUser;
        return next();
    } catch (error) {
        throw error;
    }

})

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT
}