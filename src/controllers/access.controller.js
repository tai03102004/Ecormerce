'use strict'
const AccessService = require('../services/access.service');
const {
    Created,
    SuccessResponse
} = require('../core/success.response');

class AccessController {
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res);
    }
    signUp = async (req, res, next) => {
        new Created({
            message: 'Shop created successfully!',
            metadata: await AccessService.signUp(req.body)
        }).send(res);
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout successfully!',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    handlerRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get access token successfully!',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res);
    }
}

module.exports = new AccessController();