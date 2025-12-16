require("dotenv").config();
const {
    Worker
} = require("bullmq");
const nodeMailler = require("nodemailer");
const redisConnection = require("../configs/redis.config");

const transporter = nodeMailler.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const emailWorker = new Worker(
    "emailQueue",
    async job => {
        await transporter.sendMail({
            to: job.data.email,
            subject: "Chào mừng bạn 🎉",
            html: "<h3>Đăng ký thành công</h3>"
        });

        console.log("Sent mail to:", job.data.email);
    }, {
        connection: redisConnection
    }
);

emailWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
    console.error('Worker error:', err);
});

module.exports = emailWorker;