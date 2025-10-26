'use strict'
const {
    cart
} = require('../models/cart.model')

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')
const {
    getProductById
} = require('../models/repositories/product.repo')

/* Key Features: Cart Service
    1. - add product to  cart [user]
    2. - reduce product quantity in cart [user]
    3. - increate product quantity in cart [user]
    4. - get cart details [user]
    5. - Delete cart [user]
    6. - Delete cart item [user]
 */
class CartService {
    static async createUserCart({
        userId,
        product
    }) {
        const query = {
                cart_userId: userId,
                cart_state: 'active'
            },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product
                }
            },
            options = {
                upsert: true,
                new: true
            }
        return await cart.findOneAndUpdate(
            query,
            updateOrInsert,
            options
        )
    }
    static async updateUserCartQuantity({
        userId,
        product
    }) {
        const {
            productId,
            quantity
        } = product
        const query = {
                cart_userId: userId,
                'cart_product.productId': productId,
                cart_state: 'active'
            },
            updateSet = {
                $inc: {
                    'cart_products.$.quantity': quantity
                }
            },
            options = {
                new: true,
                upsert: true
            }
        return await cart.findOneAndUpdate(query, updateSet, options)

    }
    static async deleteUserCart({
        userId,
        productId
    }) {
        const query = {
                cart_userId: userId,
                cart_state: 'active'
            },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId: productId
                    }
                }
            },
            options = {
                new: true
            }
        return await cart.findOneAndUpdate(query, updateSet, options)
    }
    static async addToCart({
        userId,
        product = {}
    }) {
        const userCart = await cart.fineOne({
            cart_userId: userId
        })
        if (!userCart) {
            // create new cart for user
            const newCart = await CartService.createUserCart({
                userId,
                product
            })
            return newCart
        }

        // if cart is existing but no products
        if (userCart.cart_products.length) {
            userCart.cart_products.push(product)
            return await userCart.save()
        }

        // if cart is existing and has products
        return await CartService.updateUserCartQuantity({
            userId,
            product
        })
    }

    // update cart
    /*
        shop_order_ids: [
            {
                shopId: 'xxx',
                order_items: [
                    {
                        productId: 'xxx',
                        quantity: 10,
                        price: 1000,
                        old_quantity: 5,
                        shopId: 'xxx'
                    }
                ],
                version: 1
            }
        ]
     */
    static async addToCartV2({
        userId,
        product = {}
    }) {
        const {
            productId,
            quantity,
            old_quantity
        } = shop_order_ids[0]?.item_product[0];
        // check product
        const foundProduct = await getProductById(productId);
        if (!foundProduct) {
            throw new NotFoundError(`Product with id ${productId} not found`)
        }

        // compare
        if (foundProduct.product_shop.toString() !== shop_order_ids[0].shopId) {
            throw new BadRequestError(`Product with id ${productId} does not belong to shop with id ${shop_order_ids[0].shopId}`)
        }

        if (quantity === 0) {
            // remove product in cart
            return await CartService.deleteUserCart({
                userId,
                productId
            })
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        })
    }

    static async getListUserCart({
        userId,
        productId
    }) {
        return await cart.findOne({
            cart_userId: +userId,
            cart_state: 'active'
        }).lean()
    }
}

module.exports = CartService