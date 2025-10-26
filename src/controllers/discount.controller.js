'use strict'

const DiscountService = require('../services/discount.service');
const {
    SuccessResponse
} = require('../core/success.response');

class DiscountController {
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create discount code successfully',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res);
    };

    updateDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update discount code successfully',
            metadata: await DiscountService.updateDiscountCode({
                ...req.body,
                shopId: req.user.userId,
                discountId: req.params.discountId
            })
        }).send(res);
    }

    getAllDiscountCodeWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all discount codes with products successfully',
            metadata: await DiscountService.getAllDiscountCodeWithProduct({
                ...req.query,
            })
        }).send(res);
    }

    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all discount codes successfully',
            metadata: await DiscountService.getAllDiscountCodesForShop({
                ...req.query
            })
        }).send(res);
    };

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get discount amount successfully',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            })
        }).send(res);
    };

    deleteDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete discount code successfully',
            metadata: await DiscountService.deleteDiscountCode({
                shopId: req.user.userId,
                discountId: req.params.discountId
            })
        }).send(res);
    };

    cancelDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cancel discount code successfully',
            metadata: await DiscountService.cancelDiscountCode({
                shopId: req.user.userId,
                discountId: req.params.discountId
            })
        }).send(res);
    }
}

module.exports = new DiscountController();