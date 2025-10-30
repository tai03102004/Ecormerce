'use strict'

const {
    inventory
} = require('../models/inventory.model');
const {
    getProductById
} = require('../models/repositories/product.repo');

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response');

class InventoryService {

    static async addStockToInventory({
        stock,
        productId,
        shopId,
        localtion = '134, Tran Phu, HCM City',
    }) {
        const product = await getProductById(productId)
        if (!product) {
            throw new BadRequestError('Product does not exist')
        }

        const query = {
                inventory_productId: productId,
                inventory_shopId: shopId
            },
            updateSet = {
                $inc: {
                    inventory_stock: stock
                },
                $setOnInsert: {
                    inventory_location: localtion,
                    inventory_productId: productId,
                    inventory_shopId: shopId
                }
            },
            options = {
                upsert: true,
                new: true
            }

        return await inventory.findOneAndUpdate(query, updateSet, options)
    }
}

module.exports = InventoryService