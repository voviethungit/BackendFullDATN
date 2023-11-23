const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const User = require("../models/User");
require("../models/Image");
const Image = require("../models/Image");
const verifyToken = require("../middleware/auth");
// Thiết lập Cloudinary
cloudinary.config({
    cloud_name: 'dqe0rgsj3',
    api_key: '964116337336331',
    api_secret: 'n8qcc7sPjVVjZBwXvA3R-GprrYU'
  });

// Thiết lập Multer để tải lên ảnh
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

router.put("/upload-avatar", verifyToken, async (req, res) => {
    const { id } = req.params;
    let avatar = req.file ? req.file.path : req.body.avatar;
    const { username, email } = req.body;
    try {
      const user = await User.findByIdAndUpdate(id, {
        username,
        email,
        avatar,
      });
      if (!user) {
        return res.status(500).json({
          success: false,
          message: "No user existed",
        });
      }
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "The user cannot be updated",
        error: error,
      });
    }
  });
  
module.exports = router;

