'use strict'

const {
    findById
} = require("../services/apiKey.service");

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
    // try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    console.log("Key: ", key);
    if (!key) throw new Error('Forbidden1');
    // check obj
    const objKey = await findById(key);
    if (!objKey) throw new Error('Forbidden2');
    req.objKey = objKey;
    return next();
    // } catch (err) {
    //     return res.status(403).json({
    //         message: 'Forbidden3'
    //     })
    // }
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'permission denied'
            })
        }

        console.log("Permissions:: ", req.objKey.permissions);

        const validPermission = req.objKey.permissions.includes(permission);
        if (!validPermission) {
            return res.status(403).json({
                message: 'permission denied'
            })
        }
        return next();
    }
}

const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

module.exports = {
    apiKey,
    permission,
    asyncHandler
}