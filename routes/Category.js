const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Category");
const Category = mongoose.model("Category");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
const multer = require("multer");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}
// API GET ONE CATEGORY
router.get("/category/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy xe" });
    }
    res.json({ success: true, category: category });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server! Liên Hệ Admin" });
  }
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// API ADD CATEGORY
router.post(
  "/add-category",
  upload.single("imageCategory"),
  verifyToken,
  checkAdmin,
  async (req, res) => {
    const { model } = req.body;
    const imageCategory = req.file; 

    if (!model)
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên danh mục !" });

    try {
      let imageUrl = "";
      if (imageCategory) {
        const bucket = admin.storage().bucket();
        const imageFileName = `${Date.now()}_${imageCategory.originalname}`;
        const fileUpload = bucket.file(imageFileName);

        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: imageCategory.mimetype,
          },
        });

        blobStream.on("error", (error) => {
          console.error(error);
          return res.status(500).json({
            success: false,
            message: "Lỗi khi tải ảnh lên Firebase Storage!",
          });
        });

        blobStream.on("finish", async () => {
          try {
            imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`;

            const newCategory = new Category({
              model,
              imageCategory: imageUrl,
            });

            await newCategory.save();

            res.json({
              success: true,
              message: "THANH CONG!",
              model: newCategory,
            });
          } catch (error) {
            console.error(error);
            res
              .status(500)
              .json({
                success: false,
                message: "Lỗi từ phía server khi thêm danh mục!",
              });
          }
        });

        blobStream.end(imageCategory.buffer);
      } else {
        const newCategory = new Category({
          model,
        });

        await newCategory.save();

        res.json({ success: true, message: "THANH CONG!", model: newCategory });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({
          success: false,
          message: "Lỗi từ phía server khi thêm danh mục!",
        });
    }
  }
);

// API GET ALL CATEGORY
router.get("/all-category", async (req, res) => {
  try {
    const categories = await Category.find({ status: { $ne: "deleted" } });
    res.json({
      success: true,
      message: "THANH CONG ! SOURCE CODE BY 5ANHEMSIEUNHAN",
      categories,
    });
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
router.put(
  "/delete-category/:id",
  verifyToken,
  checkAdmin,
  async (req, res) => {
    const categoryId = req.params.id;
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy category",
        });
      }
      if (category.status === "deleted") {
        return res.status(400).json({
          success: false,
          message: "Category đã được đánh dấu là đã xóa trước đó",
        });
      }
      category.status = "deleted";
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
  }
);

module.exports = router;
