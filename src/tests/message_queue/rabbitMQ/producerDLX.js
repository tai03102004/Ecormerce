const amqp = require('amqplib');
const {
    set
} = require('lodash');
const message = "Hello, RabbitMQ!";
async function produceMessage() {
    try {
        const connection = await amqp.connect('amqp://guest:123456@localhost');
        const channel = await connection.createChannel();
       
        

        setTimeout(() => {
            channel.close();
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error("Error producing message:", error);
    }
}

produceMessage().catch(console.error);