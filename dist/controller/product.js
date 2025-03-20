"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFilter = exports.getProductsByCategory = exports.searchProducts = exports.suggestKeywords = exports.forYouProducts = exports.minedProduct = exports.isFeatureProduct = exports.getSingleProduct = exports.getProducts = exports.updateProduct = exports.deleteImageById = exports.deleteImage = exports.productImages = exports.deleteProduct = exports.createProduct = exports.getProduct = exports.product = void 0;
const Product_1 = require("../models/Product");
const getRatingInfo_1 = require("../middleware/user_action/getRatingInfo");
const fileRemover_1 = require("../middleware/helpers/fileRemover");
const productImages_1 = require("../models/productImages");
const Orderschema_1 = require("../models/Orderschema");
const suggestKeyword_1 = require("../models/suggestKeyword");
const Category_1 = require("../models/Category");
const productBrand_1 = require("../models/productBrand");
const product = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.body;
        const product = yield Product_1.Product.findOne({ _id: productId })
            .populate("images")
            .populate("soldBy")
            .populate("brand")
            .populate({
            path: "category",
            populate: {
                path: "parent",
                model: "Category",
            }
        });
        if (!product) {
            res.json({ message: "Product not found.", status: false });
            return;
        }
        req.product = product;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.product = product;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let role = ((_a = req.authUser) === null || _a === void 0 ? void 0 : _a.role) || "user";
        const isProduct = yield Product_1.Product.findOne({ _id: req.product._id });
        if (role == "user" && (!req.product.isVerified || req.product.isDeleted)) {
            res.json({ message: "product has been deleted.", status: false });
            return;
        }
        if (role == 'admin' && req.product.isDeleted) {
            res.json({ message: "product has been deleted.", status: false });
            return;
        }
        if (role == 'user') {
            req.product.viewsCount += 1;
        }
        yield (0, getRatingInfo_1.getRatingInfo)(isProduct, 0);
        res.json({ isProduct, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, quantity, discountRate, description, brand, category, warranty, Return, color, weight, size, availableDistricts, videoURL, highlights } = req.body;
        if (!req.admin.isVerified) {
            res.json({ message: "admin is not verified", status: false });
            return;
        }
        if (req.admin.role !== 'superadmin') {
            req.body.isFeatured = null;
            req.body.isVerified = null;
        }
        if (req.admin.role == 'superadmin') {
            if (req.body.isFeatured) {
                req.body.isFeatured = Date.now();
            }
            req.body.isVerified = Date.now();
        }
        if (!name) {
            res.json({ message: "product name required", status: false });
            return;
        }
        if (!price) {
            res.json({ message: "product price required", status: false });
            return;
        }
        if (!quantity) {
            res.json({ message: "product quantity required", status: false });
            return;
        }
        if (!description) {
            res.json({ message: "product description required", status: false });
            return;
        }
        if (!warranty) {
            res.json({ message: "product warranty required", status: false });
            return;
        }
        if (!Return) {
            res.json({ message: "product return required", status: false });
            return;
        }
        if (!availableDistricts) {
            res.json({ message: "product availableDistricts required", status: false });
            return;
        }
        // brand id map
        const brandIds = brand === null || brand === void 0 ? void 0 : brand.map((item) => item.value);
        const isBrand = yield productBrand_1.ProductBrand.find({ _id: { $in: brandIds } });
        if (!isBrand) {
            res.json({ message: "Invalid brand", status: false });
            return;
        }
        // cotegory map get id
        const categoryIds = category === null || category === void 0 ? void 0 : category.map((item) => item === null || item === void 0 ? void 0 : item.value);
        const isCategory = yield Category_1.Category.find({ _id: { $in: categoryIds } });
        if (!isCategory) {
            res.json({ message: "Invalid categories", status: false });
            return;
        }
        let createProduct = yield Product_1.Product.create({
            name,
            brand: isBrand === null || isBrand === void 0 ? void 0 : isBrand.map((b) => b === null || b === void 0 ? void 0 : b._id),
            quantity: Number(quantity),
            category: isCategory.map((c) => c._id),
            warranty,
            return: Return,
            slug: Math.random(),
            soldBy: req.admin._id,
            size: size && size.map((i) => i === null || i === void 0 ? void 0 : i.label),
            color: color && color.map((c) => c === null || c === void 0 ? void 0 : c.label),
            weight: weight && weight.map((w) => w === null || w === void 0 ? void 0 : w.label),
            description,
            videoURL: videoURL && videoURL.map((v) => v),
            highlights: highlights,
            price: Number(price),
            discountRate: discountRate ? Number(discountRate) : 0,
            availableDistricts: availableDistricts.map((d) => d === null || d === void 0 ? void 0 : d.label)
        });
        res.json({ createProduct, status: true, message: "created new  product" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.createProduct = createProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isProduct = yield Product_1.Product.findOne({ _id: req.params.productId });
        if (!isProduct) {
            res.json({ message: "product not found", status: false });
            return;
        }
        isProduct.isDeleted = Date.now();
        isProduct.isVerified = null;
        isProduct.isFeatured = null;
        isProduct.isRejected = null;
        yield isProduct.save();
        res.json({ isProduct, status: true, message: "Deleted One" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.deleteProduct = deleteProduct;
const productImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.files) === null || _a === void 0 ? void 0 : _a.length)) {
            res.json({ message: "product images are required", status: false });
            return;
        }
        let files = [];
        if (!req.admin.isVerified) {
            files = req.files.map((file) => `public/uploads/product/${file === null || file === void 0 ? void 0 : file.filename}`);
            (0, fileRemover_1.fileRemoved)(files);
            res.json({ message: "admin is not verified", status: false });
            return;
        }
        const imageId = [];
        let imagesProduct = req.files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            let image = new productImages_1.ProductImages();
            const path = file === null || file === void 0 ? void 0 : file.filename;
            image.large = path;
            image.thumbnail = path;
            image.medium = path;
            image.productLink = req.params.productId;
            yield image.save();
            imageId.push(image._id);
            return image;
        }));
        imagesProduct = yield Promise.all(imagesProduct);
        console.log(imageId, 10);
        const updateImage = yield Product_1.Product.findByIdAndUpdate(req.params.productId, {
            images: imageId
        });
        res.json({ updateImage, status: true, message: "uploaded Images" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.productImages = productImages;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let product = req.product;
        let isProduct = yield Product_1.Product.findOne({ _id: product._id })
            .populate("images")
            .populate("soldBy")
            .populate("brand")
            .populate({
            path: "category",
            populate: {
                path: "parent",
                model: "Category",
            }
        });
        if (product.isVerified) {
            res.json({ message: "cannot delete image. Product has already been verified.", status: false });
            return;
        }
        let imageFound = {};
        isProduct.images = product.images.filter((img) => {
            if (img._id.toString() === req.query.image_id) {
                imageFound = img;
            }
            return img._id.toString() !== req.query.image_id;
        });
        if (!imageFound) {
            res.json({ message: "image not found", status: false });
            return;
        }
        yield isProduct.save();
        yield productImages_1.ProductImages.deleteOne({ _id: imageFound._id });
        let files = [
            `public/uploads/product/${imageFound.large}`,
            `public/uploads/product/${imageFound.medium}`,
            `public/uploads/product/${imageFound.thumbnail}`,
        ];
        (0, fileRemover_1.fileRemoved)(files);
        res.json({ isProduct, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.deleteImage = deleteImage;
const deleteImageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let image = yield productImages_1.ProductImages.findByIdAndDelete(req.query.image_id);
        if (!image) {
            res.json({ message: "image not found", status: false });
            return;
        }
        let files = [
            `public/uploads/product/${image.thumbnail}`,
            `public/uploads/product/${image.medium}`,
            `public/uploads/product/${image.large}`,
        ];
        (0, fileRemover_1.fileRemoved)(files);
        res.json({ image, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.deleteImageById = deleteImageById;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { name, price, quantity, discountRate, description, brand, category, warranty, Return, color, weight, size, availableDistricts, highlights } = (_a = req.body) === null || _a === void 0 ? void 0 : _a.values;
        let product = req.product;
        console.log((_d = (_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.values) === null || _c === void 0 ? void 0 : _c.category[0]) === null || _d === void 0 ? void 0 : _d.value, 10);
        if (product.isVerified) {
            res.json({ message: "cannot update. product has already been verified", status: false });
            return;
        }
        if (!name) {
            res.json({ message: "product name required", status: false });
            return;
        }
        if (!price) {
            res.json({ message: "product price required", status: false });
            return;
        }
        if (!quantity) {
            res.json({ message: "product quantity required", status: false });
            return;
        }
        if (!description) {
            res.json({ message: "product description required", status: false });
            return;
        }
        if (!warranty) {
            res.json({ message: "product warranty required", status: false });
            return;
        }
        if (!Return) {
            res.json({ message: "product return required", status: false });
            return;
        }
        if (!availableDistricts) {
            res.json({ message: "product availableDistricts required", status: false });
            return;
        }
        // brand map get id
        const brandIds = brand === null || brand === void 0 ? void 0 : brand.map((item) => item.value);
        const isBrand = yield productBrand_1.ProductBrand.find({ _id: { $in: brandIds } });
        if (!isBrand) {
            res.json({ message: "Invalid brand", status: false });
            return;
        }
        // cotegory map get id
        const categoryIds = category === null || category === void 0 ? void 0 : category.map((item) => item === null || item === void 0 ? void 0 : item.value);
        const isCategory = yield Category_1.Category.find({ _id: { $in: categoryIds } });
        if (!isCategory) {
            res.json({ message: "Invalid categories", status: false });
            return;
        }
        yield Product_1.Product.findByIdAndUpdate(product._id, {
            name,
            brand: isBrand === null || isBrand === void 0 ? void 0 : isBrand.map((b) => b === null || b === void 0 ? void 0 : b._id),
            quantity: Number(quantity),
            category: isCategory.map((c) => c._id),
            warranty,
            return: Return,
            size: size && size.map((i) => i === null || i === void 0 ? void 0 : i.label),
            color: color && color.map((c) => c === null || c === void 0 ? void 0 : c.label),
            weight: weight && weight.map((w) => w === null || w === void 0 ? void 0 : w.label),
            description,
            highlights: highlights,
            price: Number(price),
            discountRate: discountRate ? Number(discountRate) : 0,
            availableDistricts: availableDistricts.map((d) => d === null || d === void 0 ? void 0 : d.label)
        });
        res.json({ message: "product updated", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.updateProduct = updateProduct;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const prepage = 10;
        let query = {
            soldBy: req.admin._id,
            isDeleted: null,
        };
        const { createdAt, updatedAt, outofstock, price, status, keyword, } = req.query;
        let sortFactor = {};
        if (createdAt && (createdAt === 'asc' || createdAt === 'desc'))
            sortFactor = Object.assign(Object.assign({}, sortFactor), { createdAt });
        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc'))
            sortFactor = Object.assign(Object.assign({}, sortFactor), { updatedAt });
        if (price && (price === "1" || price === "-1"))
            sortFactor = { price: price == "1" ? 1 : -1 };
        if (keyword)
            query = Object.assign(Object.assign({}, query), { name: { $regex: keyword, $options: "i" } });
        if (status && status === 'verified')
            query = Object.assign(Object.assign({}, query), { isVerified: { $ne: null } });
        if (status && status === 'unverified')
            query = Object.assign(Object.assign({}, query), { isVerified: null });
        if (status && status === 'rejected')
            query = Object.assign(Object.assign({}, query), { isRejected: { $ne: null } });
        if (outofstock && outofstock === 'yes')
            query = Object.assign(Object.assign({}, query), { quantity: 0 });
        let products = yield Product_1.Product.find(query)
            .populate('brand')
            .populate("category")
            .populate("soldBy")
            .populate("images")
            .skip(prepage * page)
            .limit(prepage)
            .sort(sortFactor);
        const totalCount = products.length;
        const pagination = Math.ceil(Number(totalCount / prepage));
        res.json({ products, status: true, pagination, totalCount });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getProducts = getProducts;
const getSingleProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        let isProduct = yield Product_1.Product.findOne({ _id: productId })
            .populate('brand')
            .populate("category")
            .populate("soldBy")
            .populate("images");
        if (!isProduct) {
            res.json({ message: "product not found", status: false });
            return;
        }
        res.json({ isProduct, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getSingleProduct = getSingleProduct;
const isFeatureProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = {
            isFeatured: { $ne: null },
            isRejected: null,
            isDeleted: null
        };
        let isProduct = yield Product_1.Product.find(query)
            .populate('brand')
            .populate("category")
            .populate({
            path: "soldBy",
            select: "name shopName address isVerified isBlocked holidayMode photo email",
            populate: {
                path: "adminWareHouse",
                model: "AdminWareHouse",
            },
        })
            .populate("images");
        if (!isProduct) {
            res.json({ message: "product not found", status: false });
            return;
        }
        res.json({ isProduct, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.isFeatureProduct = isFeatureProduct;
const minedProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const perpage = 10;
        let query = {
            isVerified: { $ne: null },
            isDeleted: null,
        };
        let productLength = yield Product_1.Product.find(query).countDocuments();
        const pagination = Math.ceil(Number(productLength / perpage));
        let sortFactor = {};
        if (req.header('district')) {
            query = Object.assign(Object.assign({}, query), { availableDistricts: { $in: req.header('district') } });
        }
        if (req.query.keyword === 'latest') {
            sortFactor = { createdAt: 'desc' };
        }
        else if (req.query.keyword === 'featured') {
            sortFactor = { createdAt: 'desc' };
            query = Object.assign(Object.assign({}, query), { isFeatured: { $ne: null } });
        }
        else if (req.query.keyword === 'trending') {
            sortFactor = { trendingScore: -1 };
        }
        else if (req.query.keyword === 'mostviewed') {
            sortFactor = { viewsCount: -1 };
        }
        else if (req.query.keyword === 'topselling') {
            sortFactor = { noOfSoldOut: -1 };
        }
        else {
            res.json({ message: "Invalid keyword.", status: false });
            return;
        }
        let products = yield Product_1.Product.find(query)
            .populate("category", "displayName slug")
            .populate("brand", "brandName slug")
            .populate("images", "-createdAt -updatedAt -__v")
            .skip(perpage * page)
            .limit(perpage)
            .lean()
            .sort(sortFactor);
        res.json({ products, status: true, pagination });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.minedProduct = minedProduct;
const forYouProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Number(req.query.page) - 1;
        const perpage = 10;
        const { createdAt, updatedAt, price } = req.query;
        let sortFactor = {};
        if (createdAt && (createdAt === 'asc' || createdAt === 'desc'))
            sortFactor = { createdAt };
        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc'))
            sortFactor = { updatedAt };
        if (price && (price === 'asc' || price === 'desc'))
            sortFactor = { price: price === 'asc' ? 1 : -1 };
        const orders = yield Orderschema_1.Order.find({ user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id })
            .select('-_id product')
            .populate({
            path: 'product',
            select: '-_id category',
            populate: {
                path: 'category',
                model: 'category',
                select: '_id ',
                match: {
                    isDisabled: null
                },
                populate: {
                    path: 'parent',
                    model: 'category',
                    select: '_id ',
                    match: {
                        isDisabled: null
                    },
                    populate: {
                        path: 'parent',
                        model: 'category',
                        select: '_id ',
                        match: {
                            isDisabled: null
                        },
                    }
                }
            }
        });
        let categories = [];
        orders.forEach(o => {
            o.product.category.forEach((cat) => {
                categories.push(cat._id); //i.e last layer
                cat.parent && categories.push(cat.parent._id); //i.e second layer
                // cat.parent.parent && categories.push(cat.parent.parent._id) //i.e first layer
            });
        });
        categories = [...new Set(categories)];
        if (!categories.length) {
            res.json({ message: "Categories not found.", status: false });
            return;
        }
        let query = {
            category: { $in: categories }
        };
        if (req.header("district")) {
            query = Object.assign(Object.assign({}, query), { availableDistricts: { $in: req.header("district") } });
        }
        let products = yield Product_1.Product.find(query)
            .populate("category")
            .populate("brand")
            .populate("images", "-createdAt -updatedAt -__v")
            .skip(perpage * page)
            .limit(perpage)
            .lean()
            .sort(sortFactor);
        const totalCount = yield Product_1.Product.countDocuments(query);
        res.json({ products, totalCount, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.forYouProducts = forYouProducts;
const suggestKeywords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let limits = Number(req.query.limits) || 5;
        let suggestedKeywords = yield suggestKeyword_1.SuggestKeyword
            .find({ keyword: { $regex: req.query.keyword || '', $options: "i" }, isDeleted: null })
            .select('-_id keyword')
            .limit(limits);
        suggestedKeywords = suggestedKeywords.map(s => s.keyword);
        res.json({ suggestedKeywords, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.suggestKeywords = suggestKeywords;
const searchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.params.page) - 1;
        const perpage = 10;
        const { createdAt, updatedAt, price } = req.query;
        let sortFactor = {};
        if (createdAt && (createdAt === 'asc' || createdAt === 'desc'))
            sortFactor = { createdAt };
        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc'))
            sortFactor = { updatedAt };
        if (price && (price === 'asc' || price === 'desc'))
            sortFactor = { price: price === 'asc' ? 1 : -1 };
        let { brands, max_price, min_price, sizes, ratings, colors, discount, weights, cat_id, keyword = "", } = req.query;
        let categories;
        if (cat_id) {
            categories = yield Category_1.Category.find({
                $or: [{ _id: cat_id }, { parent: cat_id }],
                isDisabled: null,
            });
            if (!categories.length) {
                res.json({ error: "Categories not found.", status: false });
                return;
            }
        }
        let searchingFactor = {
            isVerified: { $ne: null },
            isDeleted: null
        };
        if (keyword && !cat_id) {
            //that is if only with keyword
            searchingFactor = Object.assign(Object.assign({}, searchingFactor), { $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { tags: { $regex: keyword, $options: "i" } },
                ] });
            if (brands)
                searchingFactor = { brand: brands };
            if (max_price && min_price) {
                searchingFactor.price = { $lte: +max_price, $gte: +min_price };
            }
            else if (min_price) {
                searchingFactor.price = { $gte: min_price };
            }
            if (sizes)
                searchingFactor.size = { $in: sizes };
            if (discount)
                searchingFactor.discountRate = Number(discount);
            if (colors)
                searchingFactor.color = { $in: colors };
            if (weights)
                searchingFactor.weight = { $in: weights };
            //  if (warranties) searchingFactor={ ...searchingFactor,warranty:warranties}
            if (ratings)
                searchingFactor.averageRating = { $gte: Number(ratings) };
        }
        else {
            if (brands)
                searchingFactor = { brand: brands };
            if (cat_id) {
                searchingFactor.category = { $in: [cat_id] };
            }
            if (max_price && min_price) {
                searchingFactor.price = { $lte: +max_price, $gte: +min_price };
            }
            if (sizes)
                searchingFactor.size = { $in: sizes };
            if (discount)
                searchingFactor.discountRate = Number(discount);
            if (colors)
                searchingFactor.color = { $in: colors };
            if (weights)
                searchingFactor.weight = { $in: weights };
            //  //  if (warranties) searchingFactor={ ...searchingFactor,warranty:warranties}
            if (ratings)
                searchingFactor.averageRating = { $gte: +ratings };
        }
        if (req.header('district')) {
            searchingFactor = Object.assign(Object.assign({}, searchingFactor), { availableDistricts: { $in: req.header('district') } });
        }
        if (!searchingFactor) {
            res.json({ message: "data not found", status: false });
            return;
        }
        let products = yield Product_1.Product.find(searchingFactor)
            .populate("category")
            .populate("brand")
            .populate("images")
            .skip(perpage * page)
            .limit(perpage)
            .lean()
            .sort(sortFactor);
        let totalCount = yield Product_1.Product.countDocuments(searchingFactor);
        const pagination = Math.ceil(Number(totalCount / perpage));
        res.json({ products, pagination, totalCount, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.searchProducts = searchProducts;
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const perpage = 10;
        const { createdAt, updatedAt, price } = req.query;
        let sortFactor = {};
        if (createdAt && (createdAt === 'asc' || createdAt === 'desc'))
            sortFactor = { createdAt };
        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc'))
            sortFactor = { updatedAt };
        if (price && (price === 'asc' || price === 'desc'))
            sortFactor = { price: price === 'asc' ? 1 : -1 };
        let categories = yield Category_1.Category.find({
            $or: [{ _id: req.query.category_id }, { parent: req.query.cat_id }],
            isDisabled: null,
        });
        if (!categories.length) {
            res.json({ message: "Categories not found", status: false });
            return;
        }
        let query = {
            category: { $in: categories },
            isVerified: { $ne: null },
            isDeleted: null
        };
        if (req.header('district')) {
            query = Object.assign(Object.assign({}, query), { availableDistricts: { $in: req.header('district') } });
        }
        categories = categories.map((c) => c._id.toString());
        let products = yield Product_1.Product.find(query)
            .populate("category")
            .populate("brand")
            .populate("images")
            .skip(perpage * page)
            .limit(perpage)
            .lean()
            .sort(sortFactor);
        const totalCount = yield Product_1.Product.countDocuments(query);
        const pagination = Math.ceil(Number(totalCount / perpage));
        res.json({ products, totalCount, status: true, pagination });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getProductsByCategory = getProductsByCategory;
const generateFilter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filterGenerate = (products) => {
            let filters = {
                sizes: [],
                brands: [],
                warranties: [],
                colors: [],
                weights: [],
                prices: [],
                ratings: [5, 4, 3, 2, 1],
                discount: []
            };
            products.forEach((p) => {
                if (!filters.brands.some((brand) => p.brand.brandName === brand.brandName))
                    filters.brands.push(p.brand);
                if (!filters.warranties.some((w) => p.warranty === w))
                    filters.warranties.push(p.warranty);
                if (!filters.prices.some((price) => p.price === price))
                    filters.prices.push(p.price);
                p.size.forEach((size) => {
                    if (!filters.sizes.includes(size))
                        filters.sizes.push(size);
                });
                p.color.forEach((color) => {
                    if (!filters.colors.includes(color))
                        filters.colors.push(color);
                });
                p.weight.forEach((weight) => {
                    if (!filters.weights.includes(weight))
                        filters.weights.push(weight);
                });
                if (!filters.discount.some((num) => p.discountRate == num))
                    filters.discount.push(p.discountRate);
            });
            //making price range =>[[min,max],[min1,max1]]7
            let min_price = Math.min(...filters.prices);
            let max_price = Math.max(...filters.prices);
            function minmax(min, max) {
                let M;
                let m;
                if (max < 100)
                    M = 100;
                if (max > 100)
                    M = max + (100 - (max % 100));
                if (max % 100 === 0)
                    M = max + 100;
                if (min < 100)
                    m = 0;
                if (min > 100)
                    m = min - (min % 100);
                if (min % 100 === 0)
                    m = min - 100;
                return [m, M];
            }
            filters.prices = minmax(min_price !== null && min_price !== void 0 ? min_price : 0, max_price !== null && max_price !== void 0 ? max_price : 0);
            console.log(filters, 'price');
            return filters;
        };
        if (req.query.keyword) {
            let products;
            let sortFactor = {
                createdAt: 'desc'
            };
            if (req.query.keyword == 'latest') {
                products = yield Product_1.Product.find({
                    isVerified: { $ne: null },
                    isDeleted: null,
                })
                    .limit(50)
                    .sort(sortFactor)
                    .populate("brand")
                    .select("-_id brand warranty size color weight price discountRate");
                let generatedFilters = filterGenerate(products);
                res.json({ generatedFilters, status: true });
                return;
            }
            products = yield Product_1.Product.find({
                $or: [
                    { name: { $regex: req.query.keyword, $options: "i" } },
                    { tags: { $regex: req.query.keyword, $options: "i" } },
                ],
                isVerified: { $ne: null },
                isDeleted: null,
            })
                .populate("brand")
                .select("-_id brand warranty size color weight price discountRate");
            let generatedFilters = filterGenerate(products);
            res.json({ generatedFilters, status: true });
            return;
        }
        else {
            //else by category
            let categories = yield Category_1.Category.find({
                $or: [{ _id: req.query.cat_id }, { parent: req.query.cat_id }],
                isDisabled: null
            });
            if (!categories.length) {
                res.json({ message: "Category not found. Cannot generate filter.", status: false });
                return;
            }
            categories = categories.map((c) => c._id.toString());
            const products = yield Product_1.Product.find({
                category: { $in: categories },
                isVerified: { $ne: null },
                isDeleted: null,
            })
                .populate("brand")
                .select("-_id brand warranty size color weight price discountRate");
            let generatedFilters = filterGenerate(products);
            res.json({ generatedFilters, status: true });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.generateFilter = generateFilter;
