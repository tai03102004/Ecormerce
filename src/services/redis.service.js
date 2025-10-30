'use strict'

const redis = require('redis')
const redisClient = redis.createClient()


redisClient.on('error', (err) => console.error('Redis Client Error:', err));

(async () => {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
})();

const acquiredLock = async (productId, quantity, cartId) => {
    const key = `lock_v2025_${productId}`
    const retriTimes = 10;
    const expireTime = 3000;

    for (let index = 0; index < retriTimes; index++) {
        const isOk = await redisClient.setNX(key, expireTime);
        console.log('isOk: ', isOk)
        if (isOk === 1) {
            // Lock acquired (inventory reserved), set expiration
            const isReversation = await reservationInventory({
                productId,
                quantity,
                cartId
            })
            if (isReversation.modifiedCount) {
                await redisClient.pExpire(key, expireTime);
                return key
            }
            return null
        } else {
            // Wait 50ms before retrying
            await new Promise(resolve => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async (keyLock) => {
    return await redisClient.del(keyLock);
}

module.exports = {
    acquiredLock,
    releaseLock
}