const {
    Schema,
    Types,
    model
} = require('mongoose');

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';
var inventorySchema = new Schema({
    inventory_productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    inventory_quantity: {
        type: Number,
        required: true
    },
    inventory_shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    inventory_location: {
        type: String,
        default: "Unknown"
    },
    inventory_reservations: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = {
    inventory: model(DOCUMENT_NAME, inventorySchema),
}