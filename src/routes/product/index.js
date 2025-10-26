'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const {
    authentication
} = require('../../auth/authUtils');
// authenticaton //

router.get('/search/:keySearch', asyncHandler(productController.searchProductsByUser));
router.get('', asyncHandler(productController.findAllProducts));
router.get('/:id', asyncHandler(productController.findProductById));

router.use(authentication);
router.post('', asyncHandler(productController.createProduct));

router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
router.post('/unPublish/:id', asyncHandler(productController.unPublishProductByShop));

router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop));
router.get('/publish/all', asyncHandler(productController.getAllPublishsForShop));
router.patch('/:id', asyncHandler(productController.updateProductById));

module.exports = router;