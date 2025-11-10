const Redis = require("ioredis");

const pub = new Redis();
const sub = new Redis();

class RedisPubSubService {
    static async publisher(channel, message) {
        try {
            const result = await pub.publish(channel, message);
            return result;
        } catch (err) {
            throw err;
        }
    }

    static subscriber(chanel, callback) {
        sub.subscribe(chanel, (err, message) => {
            if (err) {
                console.error("Failed to subscribe: %s", err.message);
            } else {
                console.log(`Subscribed successfully! This client is currently subscribed to ${message} channels.`);
            }
        })

        sub.on("message", (ch, message) => {
            if (ch === chanel) {
                callback(message);
            }
        })
    }
}

module.exports = RedisPubSubService;