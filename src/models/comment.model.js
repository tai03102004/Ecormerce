const {
    Schema,
    Types,
    model
} = require('mongoose');
const {
    type
} = require('server/reply');

const DOCUMENT_NAME = 'Comment';
const COLLECTION_NAME = 'Coments';
var commentSchema = new Schema({
    comment_productId: {
        type: Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    comment_userId: {
        type: Number,
        default: 1
    },
    comment_content: {
        type: String,
        default: 'text'
    },
    comment_left: {
        type: Number,
        default: 0
    },
    comment_right: {
        type: Number,
        default: 0
    },
    comment_parrent: {
        type: Types.ObjectId,
        ref: DOCUMENT_NAME,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = {
    comment: model(DOCUMENT_NAME, commentSchema),
}