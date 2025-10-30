'use strict'

const {
    model,
    Schema
} = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema({
    order_userId: {
        type: Number,
        required: true
    },
    /*
        order_checkout: {
            totalPrice,
            totalApplyDiscount,
            feeShip
        }
    */
    order_checkout: {
        type: Object,
        default: {}
    },
    /*
        street,
        city,
        state,
        country
    */
    order_shipping: {
        type: Object,
        default: {}
    },
    order_products: {
        type: Array,
        required: true
    },
    order_trackingNumber: {
        type: String,
        default: '#0000130102025'
    },
    order_status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
        default: 'pending'
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = {
    order: model(DOCUMENT_NAME, orderSchema)
}