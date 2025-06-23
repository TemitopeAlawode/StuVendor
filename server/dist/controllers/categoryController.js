"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryHandler = exports.updateCategoryHandler = exports.getCategoryHandler = exports.getCategoriesHandler = exports.createCategoryHandler = void 0;
// Import category model
const Category_1 = __importDefault(require("../models/Category"));
// ================================================
// @desc   Create a category
// @route  POST  /categories/add-category
// @access Public
// ================================================
const createCategoryHandler = async (req, res) => {
    try {
        const { name } = req.body;
        // Checking for empty field
        if (!name) {
            res.status(400).json({ message: "Enter a category name" });
        }
        // Checking the datatype
        if (typeof name !== "string") {
            res.status(400).json({ message: "Name must be a string" });
        }
        // Checking if the category already exists
        const existingCategory = await Category_1.default.findOne({
            where: { name },
        });
        if (existingCategory) {
            res.status(400).json({ message: "Category already exists.." });
        }
        // Creating the category and passing the value.
        const category = await Category_1.default.create({
            name,
        });
        // Displaying the output/result
        res
            .status(201)
            .json({ message: "Category created successfully", category });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating category.." });
    }
};
exports.createCategoryHandler = createCategoryHandler;
// ================================================
// @desc   Retrieve Categories
// @route  GET  /categories
// @access Public
// ================================================
const getCategoriesHandler = async (req, res) => {
    try {
        const categories = await Category_1.default.findAll();
        res.status(200).json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};
exports.getCategoriesHandler = getCategoriesHandler;
// ================================================
// @desc   Retrieve a Category by id
// @route  GET  /categories/:id
// @access Public
// ================================================
const getCategoryHandler = async (req, res) => {
    try {
        const categoryId = req.params.id;
        // const { categoryId } = req.params;
        // if (typeof categoryId !== 'string') {
        //   return res.status(400).json({ message: 'Category Id must be a string' });
        // }
        const category = await Category_1.default.findByPk(categoryId);
        if (!category) {
            res.status(404).json({ message: 'Category not found!!' });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching category..' });
    }
};
exports.getCategoryHandler = getCategoryHandler;
// ================================================
// @desc   Update a Category
// @route  PUT  /categories/:id
// @access Private
// ================================================
const updateCategoryHandler = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name } = req.body;
        const category = await Category_1.default.findByPk(categoryId);
        if (!category) {
            res.status(404).json({ message: 'Category not found!!' });
            return;
        }
        // Update Category
        category.name = name;
        await category.save();
        res.status(200).json({ message: 'Category updated successfully...', category });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating category...' });
    }
};
exports.updateCategoryHandler = updateCategoryHandler;
// ================================================
// @desc Delete a Category
// @route DELETE /categories/:id
// @access Private
// ================================================
const deleteCategoryHandler = async (req, res) => {
    try {
        // Get the id
        const categoryId = req.params.id;
        // if (typeof categoryId !== 'string') {
        //   return res.status(400).json({ message: 'Category Id must be a string' });
        // }
        const category = await Category_1.default.findByPk(categoryId);
        if (!category) {
            res.status(404).json({ message: 'Category not found!!' });
            return;
        }
        // Delete Category
        await category.destroy();
        res.status(200).json({ message: 'Category successfully deleted...' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting category...' });
    }
};
exports.deleteCategoryHandler = deleteCategoryHandler;
