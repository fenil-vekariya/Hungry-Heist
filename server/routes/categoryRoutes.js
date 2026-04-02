const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getAllCategories,
    addCategory,
    deleteCategory
} = require("../controllers/categoryController");

router.get("/", getAllCategories);

router.post("/add", authMiddleware, roleMiddleware("admin"), addCategory);
router.delete("/delete/:id", authMiddleware, roleMiddleware("admin"), deleteCategory);

module.exports = router;
