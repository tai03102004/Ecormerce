'use strict'

const express = require('express');
const uploadController = require('../../controllers/upload.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const {
    authentication
} = require('../../auth/authUtils');
const {
    uploadDisk,
    uploadMemory
} = require('../../configs/multer.config');

// authenticaton //
router.use(authentication);
router.post('/product', asyncHandler(uploadController.uploadFile));
router.post('/product/thumb', uploadDisk.single('file'), asyncHandler(uploadController.uploadThumbnail));
router.post('/product/multiple-thumb', uploadDisk.array('files', 10), asyncHandler(uploadController.uploadMultipleThumbnail));
router.post('/product/s3', uploadMemory.single('file'), asyncHandler(uploadController.uploadImageFromLocalS3));
module.exports = router;