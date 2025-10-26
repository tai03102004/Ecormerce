const {
    product,
    clothing,
    electronics,
    furniture
} = require('../models/product.model');

const {
    BadRequestError
} = require("../core/error.response");
const {
    updateProductById
} = require('../models/repositories/product.repo');
const {
    removeUndefinedObject,
    updateNestedObjectParse
} = require('../utils');
const {
    insertInventory
} = require('../models/repositories/inventory.repo');

class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    async createProduct(productId) {
        const newProduct = await product.create({
            _id: productId,
            ...this
        });
        if (newProduct) {
            await insertInventory({
                productId: newProduct._id,
                quantity: this.product_quantity,
                shopId: this.product_shop,
                location: 'Not specified',
            })
        }
        return newProduct;
    }

    async updateProduct(productId, payload) {
        return await updateProductById({
            product_id: productId,
            payload,
            model: product
        });
    }
}

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newClothing) throw new BadRequestError('Create clothing failed');
        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('Create product failed');
        return newProduct;
    }
    async updateProduct(productId) {
        const objectParam = removeUndefinedObject(this);
        if (objectParam.product_attributes) {
            const attributes = updateNestedObjectParse(objectParam.product_attributes);
            await updateProductById({
                product_id: productId,
                payload: attributes,
                model: clothing
            });
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParse(objectParam));
        if (!updateProduct) throw new BadRequestError('Update product failed');
        return updateProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronics = await electronics.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronics) throw new BadRequestError('Create electronics failed');
        const newProduct = await super.createProduct(newElectronics._id);
        if (!newProduct) throw new BadRequestError('Create product failed');
        return newProduct;
    }
    async updateProduct(productId) {
        const objectParam = this;
        if (objectParam.product_attributes) {
            await updateProductById({
                product_id: productId,
                payload: objectParam.product_attributes,
                model: electronics
            });
        }
        const updateProductById = await super.updateProduct(productId, objectParam);
        if (!updateProductById) throw new BadRequestError('Update product failed');
        return updateProductById;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError('Create furniture failed');
        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create product failed');
    }
    async updateProduct(productId) {
        const objectParam = this;
        if (objectParam.product_attributes) {
            await updateProductById({
                product_id: productId,
                payload: objectParam.product_attributes,
                model: furniture
            });
        }
        const updateProductById = await super.updateProduct(productId, objectParam);
        if (!updateProductById) throw new BadRequestError('Update product failed');
        return updateProductById;
    }
}

module.exports = {
    Product,
    Clothing,
    Electronics,
    Furniture
};