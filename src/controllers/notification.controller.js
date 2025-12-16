'use strict'

const NotificationService = require('../services/notification.service');
const {
    SuccessResponse
} = require('../core/success.response');

class notificationController {
    listNotiByUserId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add stock to inventory successfully',
            metadata: await NotificationService.listNotiByUserId({})
        }).send(res)
    }
}

module.exports = new notificationController();