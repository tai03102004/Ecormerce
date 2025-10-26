'use strict'

const {
    getSelectData,
    unGetSelectData,
    convertToObjectMongoDB
} = require('../../utils');

const {
    BadRequestError,
    NotFoundError,
} = require('../../core/error.response');

const findAllDiscountsUnSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter = {},
    unSelect,
    model
}) => {
    const skip = (limit * (page - 1));
    const sortBy = sort === 'ctime' ? {
        _id: -1
    } : {
        _id: 1
    };
    const documents = await model.find(filter).sort(sortBy).skip(skip).limit(limit).select(unGetSelectData(unSelect)).lean();
    return documents;
}

const findAllDiscountsSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter = {},
    select,
    model
}) => {
    const skip = (limit * (page - 1));
    const sortBy = sort === 'ctime' ? {
        _id: -1
    } : {
        _id: 1
    };
    const documents = await model.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean();
    return documents;
}

const checkDiscountExits = async ({
    model,
    filter
}) => {
    return await model.findOne(filter).lean();
}

module.exports = {
    findAllDiscountsUnSelect,
    findAllDiscountsSelect,
    checkDiscountExits
}