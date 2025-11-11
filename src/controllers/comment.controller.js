'use strict'
const CommentService = require('../services/comment.service');
const {
    SuccessResponse
} = require('../core/success.response');

class commentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create comment successfully!',
            metadata: await CommentService.createComment(req.body)
        }).send(res);
    }

    getCommentByParrentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get comments successfully!',
            metadata: await CommentService.getCommentsByParrentId(req.body)
        }).send(res);
    }

    deleteComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete comment successfully!',
            metadata: await CommentService.deleteComment(req.body)
        }).send(res);
    }
}

module.exports = new commentController();