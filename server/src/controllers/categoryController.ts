// Importing req and res from express
import { Request, Response } from "express";

// Import category model
import Category from "../models/Category";

// Defining interface for typechecking
interface CustomCategory {
  sn?: number;
  id?: string;
  name: string;
}

// ================================================
// @desc   Create a category
// @route  POST  /categories/add-category
// @access Public
// ================================================
export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { name }: CustomCategory = req.body;
    // Checking for empty field
    if (!name) {
      res.status(400).json({ message: "Enter a category name" });
    }
    // Checking the datatype
    if (typeof name !== "string") {
      res.status(400).json({ message: "Name must be a string" });
    }

    // Checking if the category already exists
    const existingCategory = await Category.findOne({
      where: { name },
    });
    if (existingCategory) {
      res.status(400).json({ message: "Category already exists.." });
    }

    // Creating the category and passing the value.
    const category = await Category.create({
      name,
    });

    // Displaying the output/result
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating category.." });
  }
};


// ================================================
// @desc   Retrieve Categories
// @route  GET  /categories
// @access Public
// ================================================
export const getCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
}


// ================================================
// @desc   Retrieve a Category by id
// @route  GET  /categories/:id
// @access Public
// ================================================
export const getCategoryHandler = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    // const { categoryId } = req.params;

    // if (typeof categoryId !== 'string') {
    //   return res.status(400).json({ message: 'Category Id must be a string' });
    // }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found!!' });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category..' });
  }
}


// ================================================
// @desc   Update a Category
// @route  PUT  /categories/:id
// @access Private
// ================================================
export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found!!' });
      return;
    }

    // Update Category
    category.name = name;
    await category.save();

    res.status(200).json({ message: 'Category updated successfully...', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating category...' });
  }
}

// ================================================
// @desc Delete a Category
// @route DELETE /categories/:id
// @access Private
// ================================================
export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    // Get the id
    const categoryId = req.params.id;

    // if (typeof categoryId !== 'string') {
    //   return res.status(400).json({ message: 'Category Id must be a string' });
    // }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found!!' });
      return;
    }

    // Delete Category
    await category.destroy();
    res.status(200).json({message: 'Category successfully deleted...'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting category...' });
  }
}