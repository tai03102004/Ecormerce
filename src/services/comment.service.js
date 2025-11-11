'use strict';
const {
    comment: Comment
} = require('../models/comment.model');
const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')
const {
    convertToObjectMongoDB
} = require('../utils')

const {
    findProductById
} = require('../models/repositories/product.repo');

/*
    KeyFeture:
    - Create comment: [User | Shop]
    - Get a list of Comments by ProductID: [User | Shop]
    - Delete comment: [User | Shop | Admin]

*/

class CommentService {
    createComment = async ({
        comment_productId,
        comment_userId,
        comment_content,
        comment_parrentId = null
    }) => {

        const newComment = new Comment({
            comment_productId,
            comment_userId,
            comment_content,
            comment_parrentId
        })

        let rightValue

        if (comment_parrentId) {
            const parrentComment = await Comment.findById(convertToObjectMongoDB(comment_parrentId))
            if (!parrentComment) {
                throw new NotFoundError('Parrent comment not found')
            }

            rightValue = parrentComment.comment_right

            newComment.comment_left = parrentComment.comment_right
            newComment.comment_right = parrentComment.comment_right + 1

            // update right
            await Comment.updateMany({
                comment_productId: convertToObjectMongoDB(comment_productId),
                comment_right: {
                    $gte: rightValue
                },
            }, {
                $inc: {
                    comment_right: 2
                }
            })

            // update left
            await Comment.updateMany({
                comment_productId: convertToObjectMongoDB(comment_productId),
                comment_left: {
                    $gte: rightValue
                },
            }, {
                $inc: {
                    comment_left: 2
                }
            })

            newComment.save()
            return newComment;

        } else {
            const maxRightValue = await Comment.findOne({
                comment_productId: convertToObjectMongoDB(comment_productId)
            }, 'comment_right', {
                sort: {
                    'comment_right': -1
                }
            })

            rightValue = maxRightValue ? maxRightValue.comment_right + 1 : 1

            newComment.comment_left = rightValue
            newComment.comment_right = rightValue + 1

            newComment.save()
            return newComment;
        }
    };

    getCommentsByParrentId = async ({
        comment_productId,
        comment_parrentId = null,
        limit = 50,
        offset = 0
    }) => {
        if (comment_parrentId) {
            const parrents = await Comment.findById(convertToObjectMongoDB(comment_parrentId));
            if (!parrents) {
                throw new NotFoundError('Parrent comment not found');
            }
            const comments = await Comment.find({
                comment_productId: convertToObjectMongoDB(comment_productId),
                comment_left: {
                    $gt: parrents.comment_left
                },
                comment_right: {
                    $lt: parrents.comment_right
                }
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parrent: 1,
            }).sort({
                comment_left: 1
            }).skip(offset).limit(limit);

            return comments;
        }

        const comments = await Comment.find({
            comment_productId: convertToObjectMongoDB(comment_productId),
        }).select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parrent: 1,
        }).sort({
            comment_left: 1
        }).skip(offset).limit(limit);

        return comments;
    }

    deleteComment = async ({
        productId,
        commentId,
    }) => {
        const product = await findProductById({
            product_id: productId
        })
        if (!product) {
            throw new BadRequestError('Product does not exist')
        }

        const comment = await Comment.findById(convertToObjectMongoDB(commentId))
        if (!comment) {
            throw new NotFoundError('Comment not found')
        }

        const leftValue = comment.comment_left
        const rightValue = comment.comment_right

        await Comment.deleteMany({
            comment_productId: convertToObjectMongoDB(productId),
            comment_left: {
                $gte: leftValue
            },
            comment_right: {
                $lte: rightValue
            }
        })

        const width = rightValue - leftValue + 1
        // update left
        await Comment.updateMany({
            comment_productId: convertToObjectMongoDB(productId),
            comment_left: {
                $gt: rightValue
            },
        }, {
            $inc: {
                comment_left: -width
            }
        })

        // update right
        await Comment.updateMany({
            comment_productId: convertToObjectMongoDB(productId),
            comment_right: {
                $gt: rightValue
            },
        }, {
            $inc: {
                comment_right: -width
            }
        })

        return true;
    }
}

module.exports = new CommentService();