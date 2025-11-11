'use strict'

const express = require('express');
const commentController = require('../../controllers/comment.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const {
    authentication
} = require('../../auth/authUtils');
// authenticaton //
router.use(authentication);

router.post('', asyncHandler(commentController.createComment));
router.delete('', asyncHandler(commentController.deleteComment));
router.get('', asyncHandler(commentController.getCommentByParrentId));

module.exports = router;