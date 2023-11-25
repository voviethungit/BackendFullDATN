const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Blog");
const Blog = mongoose.model("Blog");
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
// API UPLOAD BlOG
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "images/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });
  
const upload = multer({ storage: storage });
router.post("/upload-blog", verifyToken, checkAdmin, async (req, res) => {
    const { title, content, imageBlog } = req.body;
    if (!title || !content )
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập đầy đủ các thông tin !" });
  
    try {
      const newBlog = new Blog({
        title,
        content,
        imageBlog,
      });
  
      await newBlog.save();
  
      res.json({ success: true, message: "THANH CONG!", blog: newBlog });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
    }
  });
  
// API get all blog
router.get("/get-blog", async (req, res) => {
    try {
      const blogs = await Blog.find({});
      res.json({ success: true, blogs });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi Server! Liên Hệ Admin" });
    }
});
  
  // API GET ID blog
router.get("/get-blog/:id", async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Không tìm thấy Blog" });
      }
      res.json({ success: true, blog });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi Server! Liên Hệ Admin" });
    }
  });

// API DELETE BLOG
router.put("/delete-blog/:id", verifyToken, checkAdmin, async (req, res) => {
  const blogId = req.params.id;
  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy blog",
      });
    }
    if (blog.status === 'deleted') {
      return res.status(400).json({
        success: false,
        message: "Blog đã được đánh dấu là đã xóa trước đó",
      });
    }
    blog.status = 'deleted';
    const updatedBlog = await blog.save();
    res.json({
      success: true,
      message: "Blog đã được đánh dấu là đã xóa",
      category: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});

module.exports = router;
