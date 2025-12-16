const {
    Queue
} = require("bullmq");
const redisConnection = require("../configs/redis.config");

const emailQueue = new Queue("emailQueue", {
    connection: redisConnection
})

module.exports = emailQueue;