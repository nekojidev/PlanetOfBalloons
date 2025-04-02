import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const categories = await Category.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCategoriesProducts = async (req, res) => {
  try {
    const { id: categoryId } = req.params;

    const category = await Category.findOne({ _id: categoryId }).populate(
      'products',
      'name image price stock description'
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'Please provide name and description' });
    }

    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id, name, description } = req.body;
    if (!id || !name || !description) {
      return res.status(400).json({ message: 'Please provide id, name and description' });
    }
    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        description,
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Please provide id' });
    }
    const category = await Category.findById(id).populate('products');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Remove all products associated with this category
    const { products } = category;
    if (products && products.length > 0) {
      await Product.deleteMany({ _id: { $in: products.map((product) => product._id) } });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error });
  }
};


