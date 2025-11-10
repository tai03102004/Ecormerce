const redisPubSubService = require("../services/redisPubSub.service");
class ProductServiceTest {
    purchaseProduct(productId, quantity) {
        const channel = "product_purchase";
        const order = {
            productId,
            quantity
        }
        // Publish a message
        redisPubSubService.publisher(channel, JSON.stringify(order))
            .then((result) => {
                console.log(`Message published to ${result} subscribers.`);
            })
            .catch((err) => {
                console.error("Failed to publish message:", err);
            });
    }
}

module.exports = ProductServiceTest;