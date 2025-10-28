'use strict'

const express = require('express');
const cartController = require('../../controllers/cart.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const {
    authentication
} = require('../../auth/authUtils');

// routes //
// authenticaton //
router.use(authentication);
router.post('', asyncHandler(cartController.addToCart));
router.post('/update', asyncHandler(cartController.update));
router.delete('', asyncHandler(cartController.delete));
router.get('', asyncHandler(cartController.listToCart));

module.exports = router;