const {
    product,
} = require('../product.model');
const {
    Types
} = require('mongoose');
const {
    getSelectData,
    unGetSelectData,
    convertToObjectMongoDB
} = require('../../utils');

// search products
const searchProductsByUser = async (keySearch) => {
    const regexSearch = new RegExp(keySearch, 'i'); // 'i' => case insensitive
    const results = await product.find({
        $text: {
            $search: regexSearch
        },
        isPublished: true
    }, {
        score: {
            $meta: "textScore"
        }
    }).sort({
        score: {
            $meta: "textScore"
        }
    }).lean().exec();
    return results;
}

const findAllDraftsByQuery = async (query, limit, skip) => {
    return await findAllProductsByQuery(query, limit, skip);
}

const findAllPublishsByQuery = async (query, limit, skip) => {
    return await findAllProductsByQuery(query, limit, skip);
}

const findAllProductsByQuery = async (query, limit, skip) => {
    return await product.find(query).populate('product_shop', 'name email -_id')
        .sort({
            updatedAt: -1
        }).skip(skip).limit(limit).lean().exec();
}

const publishProductByShop = async ({
    product_shop,
    product_id
}) => {
    const foundShop = await product.findOne({
        product_shop,
        _id: product_id
    })
    if (!foundShop) return null;
    foundShop.isDraft = false;
    foundShop.isPublished = true;
    return await foundShop.save();
}

const findAllProducts = async ({
    limit,
    sort,
    page,
    filter,
    select
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {
        _id: -1
    } : {
        _id: 1
    };
    const products = await product.find(filter).sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean().exec();
    return products;
}

const findProductById = async ({
    product_id,
    unSelect
}) => {
    const productById = product.findById(product_id).select(unGetSelectData(unSelect)).lean().exec();
    return productById;
}

const updateProductById = async ({
    product_id,
    payload,
    model,
    isNew = true
}) => {
    return await model.findByIdAndUpdate(product_id, payload, {
        new: isNew
    }).lean().exec();
}

const getProductById = async (productId) => {
    return await product.findOne({
        _id: convertToObjectMongoDB(productId)
    }).lean().exec();
}

module.exports = {
    findAllDraftsByQuery,
    findAllPublishsByQuery,
    publishProductByShop,
    searchProductsByUser,
    findAllProducts,
    findProductById,
    updateProductById,
    getProductById
}