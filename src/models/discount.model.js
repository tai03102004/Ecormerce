const {
    Schema,
    Types,
    model
} = require('mongoose');
const {
    type
} = require('server/reply');

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'Discounts';
var discountSchema = new Schema({
    discount_name: {
        type: String,
        required: true
    },
    discount_description: {
        type: String,
        required: true
    },
    discount_type: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed_amount']
    }, // percentage, fixed_amount
    discount_value: {
        type: Number,
        required: true
    }, // percentage value or fixed amount value
    discount_max_value: {
        type: Number,
        required: false
    },
    discount_code: {
        type: String,
        required: true
    }, // unique code for the discount
    discount_start_date: {
        type: Date,
        required: true
    }, // start date of the discount
    discount_end_date: {
        type: Date,
        required: true
    }, // end date of the discount
    discount_max_uses: {
        type: Number,
    }, // maximum number of discount uses
    discount_users_count: {
        type: Number,
    }, // number of users who have used the discount
    discount_users_used: {
        type: Array,
        default: []
    },
    discount_max_uses_per_user: {
        type: Number,
    },
    discount_min_orders_value: {
        type: Number,
    },
    discount_shopId: {
        type: Types.ObjectId,
        ref: 'Shop',
        required: true
    },

    discount_isActive: {
        type: Boolean,
        default: true
    },
    discount_applies_to: {
        type: String,
        enum: ['all', 'specific'],
        required: true
    },
    discount_product_ids: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = {
    discount: model(DOCUMENT_NAME, discountSchema),
}