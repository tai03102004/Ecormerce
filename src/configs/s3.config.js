"use strict"

const {S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Config = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.AWS_BUCKET_ACCESS_TOKEN
    }
}

const s3 = new S3Client(s3Config);

module.exports = { s3, PutObjectCommand };