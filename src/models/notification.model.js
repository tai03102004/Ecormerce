const {
    Schema,
    Types,
    model
} = require('mongoose');

// ORDER-001: Successful order created
// ORDER-002: Order shipped
// PROMOTION-001: New product launch
// SHOP-001: Shop anniversary sale

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';
var notificationSchema = new Schema({
    noti_type: {
        type: String,
        required: true,
        enum: ["ORDER-001", "ORDER-002", "PROMOTION-001", "SHOP-001"]
    },
    noti_receiveId: {
        type: Number,
        required: true,
    },
    noti_senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'SHOP'
    },
    noti_content: {
        type: String,
        required: true,
    },
    noti_options: {
        type: Object,
        required: false,
        default: {}
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = {
    notification: model(DOCUMENT_NAME, notificationSchema),
}