'use strict'

const CartService = require('../services/cart.service');
const {
    SuccessResponse
} = require('../core/success.response');

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add to cart successfully',
            metadata: await CartService.createUserCart({
                userId: req.user.userId,
                product: req.body
            })
        }).send(res)
    }

}

module.exports = new CartController();