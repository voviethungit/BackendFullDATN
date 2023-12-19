const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Blog");
const Blog = mongoose.model("Blog");
const multer = require("multer");
const admin = require("firebase-admin");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}
// API UPLOAD BlOG
  
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
router.post("/upload-blog", upload.single("imageBlog"), verifyToken, checkAdmin, async (req, res) => {
    const { title, content } = req.body;
    const imageBlog = req.file;
  
    if (!title || !content || !imageBlog) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin và tải lên ảnh cho blog!",
      });
    }
  
    try {
      const bucket = admin.storage().bucket();
      const imageFileName = `${Date.now()}_${imageBlog.originalname}`;
      const fileUpload = bucket.file(imageFileName);
  
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: imageBlog.mimetype,
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
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`;
  
          const newBlog = new Blog({
            title,
            content,
            imageBlog: imageUrl,
          });
  
          await newBlog.save();
  
          res.json({ success: true, message: "Tạo blog thành công!", blog: newBlog });
        } catch (error) {
          console.log(error);
          res.status(500).json({ success: false, message: "Lỗi từ phía server khi tạo blog!" });
        }
      });
  
      blobStream.end(imageBlog.buffer);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi Server !" });
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

  // API UPDATE BLOG
router.put("/update-blog/:id", verifyToken, checkAdmin, async (req, res) => {
  const blogId = req.params.id;
  const { title, content, imageBlog } = req.body;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy blog",
      });
    }

    // Cập nhật thông tin blog nếu các trường được gửi trong request body
    if (title) {
      blog.title = title;
    }
    if (content) {
      blog.content = content;
    }
    if (imageBlog) {
      blog.imageBlog = imageBlog;
    }

    const updatedBlog = await blog.save();
    res.json({
      success: true,
      message: "Thông tin blog đã được cập nhật",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});

module.exports = router;


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
