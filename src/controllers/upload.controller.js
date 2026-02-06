'use strict'

const {
    uploadImageFromURL, 
    uploadImageFromLocal, 
    uploadMultipleImagesFromLocal, 
    uploadImageFromLocalS3} = require('../services/upload.service');
const {
    SuccessResponse
} = require('../core/success.response');
const {
    BadRequestError
} = require('../core/error.response');

class uploadController {
    uploadFile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add stock to inventory successfully',
            metadata: await uploadImageFromURL()
        }).send(res)
    }
    uploadThumbnail = async (req, res, next) => {
        const {file} = req;
        if (!file) {
            return new BadRequestError('Upload file error');
        }
        new SuccessResponse({
            message: 'Upload thumbnail successfully',
            metadata: await uploadImageFromLocal({
                path: file.path,
                filename: file.filename
            })
        }).send(res)
    }
    uploadMultipleThumbnail = async (req, res, next) => {
        const {files} = req;
        if (!files || files.length === 0) {
            return new BadRequestError('Upload files error');
        }
        new SuccessResponse({
            message: 'Upload multiple thumbnails successfully',
            metadata: await uploadMultipleImagesFromLocal({
                files
            })
        })
    }
    uploadImageFromLocalS3 = async (req,res,next) => {
        const {file} = req;
        if (!file) {
            return new BadRequestError('Upload file error');
        }
        new SuccessResponse({
            message: 'Upload image from local to S3 successfully',
            metadata: await uploadImageFromLocalS3({
                file
            })
        }).send(res)
    }
}

module.exports = new uploadController();