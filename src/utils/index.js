'use strict'

const pick = require('lodash/pick');
const getInfoData = ({
    fields = [],
    object = {}
}) => {
    return pick(object, fields);
}

const {
    Types
} = require("mongoose");
const convertToObjectMongoDB = id => new Types.ObjectId(id);

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(item => [item, 1]));
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(item => [item, 0]));
}

const removeUndefinedObject = (obj = {}) => {
    return Object.fromEntries( // Convert array of key-value pairs back into an object
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null) // Convert object to array of key-value pairs and filter out undefined or null values
    )
}

const updateNestedObjectParse = (obj = {}) => {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const nestedObj = updateNestedObjectParse(value);
            for (const [nestedKey, nesteValue] of Object.entries(nestedObj)) {
                result[`${key}.${nestedKey}`] = nesteValue;
            }
        } else {
            result[key] = value;
        }
    }
    return result;
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParse,
    convertToObjectMongoDB
}