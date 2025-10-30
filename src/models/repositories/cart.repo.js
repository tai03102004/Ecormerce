'use strict'

const {
    convertToObjectMongoDB
} = require('../../utils')
const {
    cart
} = require('../cart.model')
const {
    getProductById
} = require('./product.repo')

const findCartById = async (cartId) => {
    return await cart.findOne({
        _id: convertToObjectMongoDB(cartId),
        cart_state: 'active'
    })
}

const checkProductByServer = async (products) => {
    return await Promise.all(products.map(async (product) => {
        const foundProduct = await getProductById(product.productId)
        if (!foundProduct) {
            throw new NotFoundError(`Product with ID ${product.productId} not found`)
        }
        return {
            price: foundProduct.product_price,
            quantity: product.quantity,
            productId: product.productId
        }
    }))
}

module.exports = {
    findCartById,
    checkProductByServer
}