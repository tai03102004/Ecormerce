'use strict'

const express = require('express');
const checkoutController = require('../../controllers/checkout.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const {
    authentication
} = require('../../auth/authUtils');

// get amount a discount

// authenticaton //
router.use(authentication);
router.post('/review', asyncHandler(checkoutController.checkoutReview));

module.exports = router;