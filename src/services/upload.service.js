'use strict'

// 1. upload from url image
const cloudinary = require('../configs/cloudinary');
const {s3 , PutObjectCommand ,GetObjectCommand} = require('../configs/s3.config');
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getSignedUrl } =  require("@aws-sdk/cloudfront-signer");

const crypto = require('crypto');
const urlImagePublic = 'https://dh9vmcsnw0a30.cloudfront.net';
//// S3 upload image ////
const randomFileName = () => crypto.randomBytes(16).toString('hex');
const uploadImageFromLocalS3 = async ({ file }) => {
    const fileName = randomFileName();
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype, // that is what your need!
    });

    const result = await s3.send(command)
    // const getObjectCommand = new GetObjectCommand({
    //     Bucket: process.env.AWS_BUCKET_NAME,
    //     Key: command.input.Key,
    // })

    // const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
    
    // have cloudFront url export
    const url = getSignedUrl({
        url: `${urlImagePublic}/${fileName}`,
        keyPairId: process.env.PUBLIC_KEY_CLOUDFRONT,
        dateLessThan: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        privateKey: process.env.PRIAVATE_KEY_CLOUDFRONT,
    });   

    console.log('Signed URL: ', url);
    return {
        url,
        result
    }
}


/// End S3 upload image ///

const uploadImageFromURL = async () => {
    const imageURL = 'https://down-vn.img.susercontent.com/file/e9398a166092f18f786ab6ed3574836c.webp';
    const folderId = 'products/shopId';
    const fileName = 'product-name';
    const options = {
        folder: folderId,
        public_id: fileName,
    };

    const result = cloudinary.uploader.upload(imageURL, options);
    return result;
}

// 2. Upload image from local
const uploadImageFromLocal = async ({
    path,
    filename,
    folderId = 'product/shopId'
}) => {
    const result = await cloudinary.uploader.upload(path, {
        folder: folderId,
        public_id: filename,
    });

    return {
        image_url: result.secure_url,
        shopId: folderId,
        thumb_url: await cloudinary.url(result.public_id, {
            width: 100,
            height: 100,
            Crop: 'fill',
            format: 'jpg'
        })
    }
}

// 3. Upload Multiple images from local
const uploadMultipleImagesFromLocal = async({
    files,
    folderId = 'products/shopId'
}) => {
    const uploadPromises = files.map(async(file) => {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folderId,
            public_id: file.filename,
        })
        return {
            image_url: result.secure_url,
            public_id: result.public_id,
            thumb_url: cloudinary.url(result.public_id, {
                width: 100,
                height: 100,
                crop: 'fill',
                format: 'jpg'
            })
        };
    })

    return await Promise.all(uploadPromises);
}

module.exports = {
    uploadImageFromURL,
    uploadImageFromLocal,
    uploadMultipleImagesFromLocal,
    uploadImageFromLocalS3
}