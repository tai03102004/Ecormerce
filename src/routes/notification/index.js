'use strict'

const express = require('express');
const notificationController = require('../../controllers/notification.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const {
    authentication
} = require('../../auth/authUtils');
// authenticaton //
router.use(authentication);
router.get('', asyncHandler(notificationController.listNotiByUserId));

module.exports = router;