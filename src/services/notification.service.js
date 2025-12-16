'use strict'

const {
    notification
} = require('../models/notification.model')

class NotificationService {
    static pushNotiToSystem = async ({
        type = 'SHOP-001',
        receiverId = 1,
        senderId = 1,
        options = {}
    }) => {
        let noti_content
        switch (type) {
            case 'ORDER-001':
                noti_content = `Your order has been successfully created.`
                break
            case 'ORDER-002':
                noti_content = `Your order has been shipped.`
                break
            case 'PROMOTION-001':
                noti_content = `Check out our new product launch!`
                break
            case 'SHOP-001':
                noti_content = `@@@ Add to new product: @@@@`
                break
            default:
                noti_content = `You have a new notification.`
        }

        return await notification.create({
            noti_type: type,
            noti_receiveId: receiverId,
            noti_senderId: senderId,
            noti_content,
            noti_options: options
        })
    }

    static listNotiByUserId = async ({
        userId = 1,
        type = 'ALL',
        isRead = 0
    }) => {
        const match = {
            noti_receiveId: userId
        }

        if (type !== 'ALL') {
            match.noti_type = type
        }

        console.log('Match Object: ', match)

        return await notification.aggregate([{
            $match: match
        }, {
            $project: {
                noti_type: 1,
                noti_content: {
                    $concat: [{
                        $toString: "$noti_options.productId"
                    }, ' add to new product: ', {
                        $substr: ['$noti_options.productName', 0, -1],
                    }]
                },
                noti_receiveId: 1,
                noti_senderId: 1,
                noti_options: 1,
                createdAt: 1
            }
        }])
    }
}

module.exports = NotificationService