'use strict'

const {
    BadRequestError,
    NotFoundError,
} = require('../core/error.response');
const {
    discount
} = require('../models/discount.model');
const {
    convertToObjectMongoDB
} = require('../utils');
const {
    findAllProducts
} = require("../models/repositories/product.repo");
const {
    findAllDiscountsUnSelect,
    findAllDiscountsSelect,
    checkDiscountExits
} = require('../models/repositories/discount.repo');

/**
    Discount Service
    1 - Generate discount codes (SHOP | ADMIN)
    2 - Get discount amount(USER)
    3 - Get all discount codes (SHOP | USER)
    4 - verify discount code (USER)
    5 - Delete discount code (ADMIN | SHOP)
    6 - Cancel discount (USER)
*/

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
        } = payload;
        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError('Invalid discount code date range');
        }
        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date');
        }
        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectMongoDB(shopId)
            }
        })

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount code already exists');
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_max_value: max_value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_users_count: uses_count,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_orders_value: min_order_value || 0,
            discount_shopId: convertToObjectMongoDB(shopId),
            discount_product_ids: applies_to === "specific" ? product_ids : [],
            discount_applies_to: applies_to,
            discount_is_active: is_active
        });

        return newDiscount;
    }

    static async updateDiscountCode({
        code,
        shopId,
        payload
    }) {
        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectMongoDB(shopId)
            }
        })
        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount code not found');
        }

        const updateDiscount = await discount.findByIdAndUpdate({
            _id: foundDiscount._id,
            payload
        }, {
            new: true
        }).lean().exec();

        return updateDiscount;
    }

    static async getAllDiscountCodeWithProduct({
        code,
        shopId,
        limit,
        page
    }) {
        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectMongoDB(shopId)
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found');
        }

        const {
            discount_applies_to,
            discount_product_ids
        } = foundDiscount;

        let products;

        if (discount_applies_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectMongoDB(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        if (discount_applies_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    _id: {
                        $in: discount_product_ids
                    },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products;
    }

    /**
     * get all discount codes for a shop
     */

    static async getAllDiscountCodesForShop({
        shopId,
        limit,
        page
    }) {

        const discounts = await findAllDiscountsUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectMongoDB(shopId),
                discount_isActive: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })

        return discounts;
    }

    static async getDiscountAmount({
        codeId,
        userId,
        shopId,
        products
    }) {
        console.log("codeId", codeId);
        console.log("shopId", shopId);
        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectMongoDB(shopId)
            }
        })
        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found');
        }
        const {
            discount_isActive,
            discount_max_uses,
            discount_min_orders_value,
            discount_user_used,
            discount_max_uses_per_user,
            discount_type,
            discount_value,
            discount_start_date,
            discount_end_date
        } = foundDiscount;
        if (!discount_isActive) {
            throw new BadRequestError('Discount code is not active');
        }
        if (discount_max_uses <= 0) {
            throw new BadRequestError('Discount code has reached its maximum uses');
        }
        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            throw new BadRequestError('Discount code is not valid at this time');
        }
        let totalOrderValue = 0;
        if (discount_min_orders_value > 0) {
            totalOrderValue = products.reduce((total, product) => total + product.price * product.quantity, 0);
            if (totalOrderValue < discount_min_orders_value) {
                throw new BadRequestError(`Minimum order value for this discount is ${discount_min_orders_value}`);
            }
        }
        if (discount_max_uses_per_user > 0) {
            const userUsedDiscount = discount_user_used.find(user => user.userId.toString() === userId.toString());
            if (userUsedDiscount && userUsedDiscount.uses >= discount_max_uses_per_user) {
                throw new BadRequestError('You have reached the maximum uses for this discount code');
            }
        }

        const amount = discount_type === 'fixed_amount' ? discount_value : (totalOrderValue * discount_value) / 100;
        return {
            totalOrderValue,
            discount: amount,
            totalPrices: totalOrderValue - amount
        }
    }
    
    static async deleteDiscountCode({
        shopId,
        codeId
    }) {
        const deleted = await discount.findOneAndDelete({
            _id: codeId,
            discount_shopId: convertToObjectMongoDB(shopId)
        })
        return deleted;
    }

    static async cancelDiscountCode({
        codeId,
        shopId,
        userId
    }) {
        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectMongoDB(shopId)
            }
        })
        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found');
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $inc: {
                discount_max_uses: 1,
                discount_users_count: -1
            },
            $pull: {
                discount_user_used: {
                    userId: convertToObjectMongoDB(userId)
                }
            }
        }, {
            new: true
        })
        return result
    }
}

module.exports = DiscountService;