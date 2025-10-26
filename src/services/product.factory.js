const {
    BadRequestError
} = require("../core/error.response");
const {
    ProductType
} = require("../configs/products.config");
const {
    findAllDraftsByQuery,
    publishProductByShop,
    findAllPublishsByQuery,
    searchProductsByUser,
    findAllProducts,
    findProductById
} = require("../models/repositories/product.repo");
class ProductFactory {
    static productsRegistry = {};
    static registerProductType(type, cls) {
        if (cls.prototype.createProduct === undefined) {
            throw new Error("createProduct method not implemented");
        }
        this.productsRegistry[type] = cls;
    }

    static registerProductAll(types) {
        types.forEach(({
            type,
            cls
        }) => {
            this.registerProductType(type, cls);
        });
    }

    static async createProduct(type, payload) {
        const ProductClass = this.productsRegistry[type]; // Clothing
        if (!ProductClass) {
            throw new BadRequestError(`Product type ${type} not registered.`);
        }
        const productInstance = new ProductClass(payload);
        console.log("productInstance: ", productInstance);
        return await productInstance.createProduct();
    }

    static async updateProduct(type, productId, payload) {
        console.log("type: ", type);
        const ProductClass = this.productsRegistry[type]; // Clothing
        console.log("ProductClass: ", ProductClass);
        if (!ProductClass) {
            throw new BadRequestError(`Product type ${type} not registered.`);
        }
        const productInstance = new ProductClass(payload);
        return await productInstance.updateProduct(productId, payload);
    }

    static async getAllDraftForShop({
        product_shop,
        limit = 50,
        skip = 0
    }) {
        const query = {
            product_shop,
            isDraft: true
        };
        return await findAllDraftsByQuery(query, limit, skip);
    }

    static async getAllPublishForShop({
        product_shop,
        limit = 50,
        skip = 0
    }) {
        const query = {
            product_shop,
            isPublished: true
        };
        return await findAllPublishsByQuery(query, limit, skip);
    }
    static async publishProductByShop({
        product_shop,
        product_id
    }) {
        const foundShop = await publishProductByShop({
            product_shop,
            product_id
        });
        if (!foundShop) return null;
        return foundShop;
    }

    static async unPublishProductByShop({
        product_shop,
        product_id
    }) {
        const foundShop = await publishProductByShop({
            product_shop,
            product_id
        });
        if (!foundShop) return null;
        foundShop.isPublished = false;
        foundShop.isDraft = true;
        return await foundShop.save();
    }

    static async searchProducts({
        keySearch
    }) {
        return await searchProductsByUser(keySearch);
    }

    static async findAllProducts({
        limit = 50,
        sort = 'ctime',
        page = 1,
        filter = {
            isPublished: true
        }
    }) {
        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select: ['product_name', 'product_price', 'product_thumb']
        });
    }

    static async findProductById(product_id) {
        return await findProductById({
            product_id,
            unSelect: ['__v', 'createdAt', 'updatedAt']
        });
    }


}

ProductFactory.registerProductAll(ProductType);

module.exports = ProductFactory;