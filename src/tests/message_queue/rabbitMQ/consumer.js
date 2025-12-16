const amqp = require('amqplib');
async function consumerMessage() {
    try {
        const connection = await amqp.connect('amqp://guest:123456@localhost');
        const channel = await connection.createChannel();
        const queue = 'test_queue';

        await channel.assertQueue(queue, {
            durable: false
        });

        channel.consume(queue, (msg) => {
            console.log(" [x] Received '%s'", msg.content.toString());
        }, {
            noAck: true
        });

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error("Error producing message:", error);
    }
}

consumerMessage().catch(console.error);