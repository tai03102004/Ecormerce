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

module.exports = {
    insertInventory
}