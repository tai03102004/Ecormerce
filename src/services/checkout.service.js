'use strict'
const {
    findCartById,
    deleteUserCart
} = require('../models/repositories/cart.repo')

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const {
    getDiscountAmount
} = require('./discount.service')

const {
    checkProductByServer
} = require('../models/repositories/cart.repo')

const {
    acquiredLock,
    releaseLock
} = require('./redis.service')

const {
    order
} = require('../models/order.model')

class CheckoutService {
    /*
        {
            cartId,
            userId,
            shop_order_idx: [
                {
                    shopId,
                    shop_discount: [],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }, {
                    shopId,
                    shop_discount: [
                        {
                            shopId,
                            discountId,
                            codeId
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
    
    /**
     * 
     * @param {*} shop_order_ids is array of shop orders
     * @returns {
     *  shop_order_ids is array of shop orders,
     *  shop_order_ids_new is array of shop orders after apply discount,
     *  checkout_order is object checkout order {
     *     totalPrice, feeShip, totalDiscount, totalCheckout
     *  } 
     * }
     */
    static async checkoutReview({
        cartId,
        userId,
        shop_order_ids
    }) {
        const foundCart = await findCartById(cartId)
        if (!foundCart) {
            throw new BadRequestError('Cart not found')
        }
        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0,
        },
        shop_order_ids_new = []

        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = []
            } = shop_order_ids[i];

            const checkProductServer = await checkProductByServer(item_products);
            if (!checkProductServer[0]) throw new BadRequestError('Order wrong!!');

            // calculate original price
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.price * product.quantity)
            }, 0)

            // sum before discount
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // before discount
                priceApplyDiscount: checkoutPrice, // after discount
                item_products: checkProductServer
            }

            if (shop_discounts.length > 0) {
                // get discount from service
                const {
                    discount = 0
                } = await getDiscountAmount({
                    codeId: shop_discounts?.[0]?.codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })

                checkout_order.totalDiscount += discount

                // if have discount and discount price > 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    // order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const {
            shop_order_ids_new,
            checkout_order
        } = await this.checkoutReview({
            cartId,
            userId,
            shop_order_ids: shop_order_ids
        })

        // check lai  mot lan nua xem vuot ton kho hay khong?
        // get new array Products optimistic locks and pessimistic locking => de xu ly tru ton kho
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const {
                productId,
                quantity
            } = products[i];
            const keyLock = await acquiredLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        // check if co 1 san pham het hang trong kho
        if (acquireProduct.includes(false)) {
            throw new NotFoundError('Some products are out of stock')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        // TH: new insert thanh cong -> remove product in my cart
        if (newOrder) {
            await deleteUserCart(userId, cartId)
        }

        return newOrder
    }
    /*
        1. query Order [Users]
    */

    static async getOrderByUser({userId, limit = 10, page = 1}) {
        return await order.find({
            order_userId: userId
        })
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ ctime: -1 })
    }

    /*
        1. query Order Using Id [Users]
    */

    static async getOneOrderByUser({userId, orderId}) {
        const foundOrder = await order.findOne({
            _id: orderId,
            order_userId: userId
        }).lean()

        if (!foundOrder) {
            throw new NotFoundError('Order not found')
        }
        return foundOrder
    }
    /*
        1. cancel Order [Users]
    */

    static async cancelOrderByUser({userId, orderId}) {
        const foundOrder = await order.findOne({
            _id: orderId,
            order_userId: userId
        }).lean()


    }
    /*
        1. Update Order Status  [Shop | Admin]
    */

    static async updateOrderStatusShop({userId, orderId, status}) {
        const foundOrder = await order.findOne({
            _id: orderId
        }).lean()

        if (!foundOrder) {
            throw new NotFoundError('Order not found')
        }
        return foundOrder

    }
}

module.exports = CheckoutService