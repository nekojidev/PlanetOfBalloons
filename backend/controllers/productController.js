import Product from '../models/Product.js';
import Category from '../models/Category.js';


export const getProducts = async (req, res) => {

    const { page = 1, limit = 10 } = req.query;
    const products = await Product.find()
    .populate('category', 'name description') 
        .skip((page - 1) * limit)
        .limit(limit);
    res.status(200).json({ products });


}

export const getProductById = async (req, res) => {

    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId }).populate("category", "name, description");
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ product });


}

export const createProduct = async (req, res) => {

    const { name, description, price, image, category, stock } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category ID" });
    }
    


    const product = await Product.create({
        name,
        description,
        price,
        image,
        category,
        stock
    });

    categoryExists.products.push(product._id);
    await categoryExists.save();

    res.status(201).json({ product });
    

}

export const updateProduct = async (req, res) => {

    const {id, name, description, price, category, image, stock } = req.body;

    if(!id || !name || !description || !price || !category || !stock) {
        return res.status(400).json({ message: 'Please provide id, name, description, price, category and stock' });
    }

    // Fetch the old product before updating
    const oldProduct = await Product.findById(id);
    if (!oldProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findByIdAndUpdate(id, {
        name,
        description,
        price,
        image,
        category,
        stock,
        
    }
    , { new: true });

    // Update the category's products array
    if (oldProduct.category.toString() !== category) {
        // Remove the product from the old category
        const oldCategory = await Category.findById(oldProduct.category);
        if (oldCategory) {
            oldCategory.products = oldCategory.products.filter(
                (productId) => productId.toString() !== id
            );
            await oldCategory.save();
        }

        // Add the product to the new category
        const newCategory = await Category.findById(category);
        if (newCategory) {
            newCategory.products.push(id);
            await newCategory.save();
        }
    }

    res.status(200).json({ product });
}

export const deleteProduct = async (req, res) => {
    
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ message: 'Please provide id' });
    }
    const product = await Product.findById(id).populate("category");

    if(!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    
    // Remove the product from the category's products array
    const category = await Category.findById(product.category._id);
    if (category) {
        category.products = category.products.filter(
            (productId) => productId.toString() !== id
        );
        await category.save();
    }

    await product.deleteOne()

    res.status(200).json({ message: 'Product deleted successfully' });

}

