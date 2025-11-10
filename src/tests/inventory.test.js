const redisPubSubService = require("../services/redisPubSub.service");
class InventoryServiceTest {
    subcribeInventory() {
        const channel = "product_purchase";

        redisPubSubService.subscriber(
            channel, (msg) => {
                console.log("Received message:", msg);
                const data = JSON.parse(msg);
                console.log(`Updating inventory for product ${data.productId} with quantity ${data.quantity}`);
            });
    }
}

module.exports = InventoryServiceTest;