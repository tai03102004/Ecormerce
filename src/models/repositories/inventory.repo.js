const {
    convertToObjectMongoDB
} = require("../../utils");
const {
    inventory
} = require("../inventory.model")

const insertInventory = async ({
    productId,
    quantity,
    shopId,
    location,
    reversations
}) => {
    const newInventory = await inventory.create({
        inventory_productId: productId,
        inventory_quantity: quantity,
        inventory_shopId: shopId,
        inventory_location: location,
        inventory_reservations: reversations
    })
    return newInventory;
}

const reservationInventory = async ({
    productId,
    quantity,
    cartId
}) => {
    const query = {
            inventory_productId: convertToObjectMongoDB(productId),
            inventory_stock: {
                $gte: quantity
            }
        },
        updateSet = {
            $inc: {
                inventory_stock: -quantity
            },
            $push: {
                inventory_reservations: {
                    cartId,
                    quantity,
                    reservedAt: new Date()
                }
            }
        },
        options = {
            new: true,
            upsert: true
        }
    return await inventory.updateOne(query, updateSet, options)
}

const cancelReservationInventory = async ({
    productId, quantity, cartId
}) => {
    const query = {
        inventory_productId: convertToObjectMongoDB(productId),
    }
    const updateSet = {
        $inc: {
            inventory_stock: quantity
        }, 
        $pull: {
            inventory_reservations: {
                cartId
            }
        }
    }
    return await inventory.updateOne(query, updateSet)
}

module.exports = {
    insertInventory,
    reservationInventory,
    cancelReservationInventory
}