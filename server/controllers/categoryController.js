const Category = require("../models/Category");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error fetching categories" });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new Category({ name });
        await category.save();

        res.status(201).json({ message: "Category added successfully", category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error adding category" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error deleting category" });
    }
};
