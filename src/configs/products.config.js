const {
    Clothing,
    Electronics,
    Furniture
} = require("../services/product.service");

const ProductType = [{
        type: "Clothing",
        cls: Clothing
    },
    {
        type: "Electronics",
        cls: Electronics
    },
    {
        type: "Furniture",
        cls: Furniture
    },
];

module.exports = {
    ProductType
};