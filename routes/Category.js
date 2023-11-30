const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Category");
const Category = mongoose.model("Category");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");


// API ADD CATEGORY
router.post("/add-category",  verifyToken, checkAdmin, async (req, res) => {
    const { model, imageCategory } = req.body;
    if (!model)
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên danh mục !" });
  
    try {
      const newCategory = new Category({
        model,
        imageCategory
      });
  
      await newCategory.save();
  
      res.json({ success: true, message: "THANH CONG!", model: newCategory });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
    }
  });

// API GET ALL CATEGORY
router.get("/all-category", async (req, res) => {
  try {
    const categories = await Category.find({status: { $ne: 'deleted' }});
    res.json({ success: true, message: "THANH CONG ! SOURCE CODE BY 5ANHEMSIEUNHAN", categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
  }
});


// API EDIT CATEGORY
router.put("/edit-category/:id", verifyToken, checkAdmin, async (req, res) => {
  const categoryId = req.params.id; 
  const { model, imageCategory } = req.body; 

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    
    if (model) {
      category.model = model;
    }
    if (imageCategory) {
      category.imageCategory = imageCategory;
    }
    
    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: "Thông tin Category đã được cập nhật",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});


// API DELETE CATEGORY
router.put("/delete-category/:id", verifyToken, checkAdmin, async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }
    if (category.status === 'deleted') {
      return res.status(400).json({
        success: false,
        message: "Category đã được đánh dấu là đã xóa trước đó",
      });
    }
    category.status = 'deleted';
    const updatedCategory = await category.save();
    res.json({
      success: true,
      message: "Category đã được đánh dấu là đã xóa",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});

module.exports = router;
