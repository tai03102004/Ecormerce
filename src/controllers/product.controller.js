'use strict'
const ProductService = require('../services/product.factory');
const {
    SuccessResponse
} = require('../core/success.response');

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create product successfully!',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    }
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list drafts for shop successfully!',
            metadata: await ProductService.getAllDraftForShop({
                product_shop: req.user.userId,
            })
        }).send(res);
    }
    getAllPublishsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list publishs for shop successfully!',
            metadata: await ProductService.getAllPublishForShop({
                product_shop: req.user.userId,
            })
        }).send(res);
    }

    publishProductByShop = async (req, res, next) => {
        const product_id = req.params.id;
        new SuccessResponse({
            message: 'Publish product for shop successfully!',
            metadata: await ProductService.publishProductByShop({
                product_shop: req.user.userId,
                product_id: product_id
            })
        }).send(res);
    }

    unPublishProductByShop = async (req, res, next) => {
        const product_id = req.params.id;
        new SuccessResponse({
            message: 'UnPublish product for shop successfully!',
            metadata: await ProductService.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: product_id
            })
        }).send(res);
    }

    searchProductsByUser = async (req, res, next) => {
        const keySearch = req.params.keySearch;
        new SuccessResponse({
            message: 'Search products successfully!',
            metadata: await ProductService.searchProducts({
                keySearch
            })
        }).send(res);
    }

    findAllProducts = async (req, res, next) => {
        const {
            limit,
            sort,
            page,
            filter,
            select
        } = req.query;
        new SuccessResponse({
            message: 'Get list products successfully!',
            metadata: await ProductService.findAllProducts({
                limit,
                sort,
                page,
                filter,
                select
            })
        }).send(res);
    }

    findProductById = async (req, res, next) => {
        const product_id = req.params.id;
        new SuccessResponse({
            message: 'Get product by id successfully!',
            metadata: await ProductService.findProductById(product_id)
        }).send(res);
    }

    updateProductById = async (req, res, next) => {
        const product_id = req.params.id;
        new SuccessResponse({
            message: 'Update product by id successfully!',
            metadata: await ProductService.updateProduct(req.body.product_type, product_id, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    }
}

module.exports = new ProductController();