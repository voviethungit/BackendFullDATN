const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("User");
const argon2 = require("argon2");
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const imageRoutes = require('./Image');

// verify-middleware
router.get("/", verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "User Not Found" });
      res.json({ success: true, user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  router.use('/images', imageRoutes);

router.post("/register", async (req, res) => {
      const { fullName, password, email, location, phoneNumber} = req.body;

      if (!fullName || !password || !email || !phoneNumber || !location) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ tất cả thông tin!",
        });
      }

      try {
        const user = await User.findOne({ email });

        if (user) {
          return res.status(400).json({
            success: false,
            message: "Tài khoản đã có sẵn",
          });
        }

        const hashedPassword = await argon2.hash(password);

        const newUser = new User({
          fullName,
          password: hashedPassword,
          email,
          phoneNumber,
          location,
        });

        await newUser.save();

        const accessToken = jwt.sign(
          { userId: newUser._id },
          process.env.ACCESS_TOKEN_SECRET
        );

        res.json({
          success: true,
          message: "Tạo tài khoản thành công!",
          accessToken,
        });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi từ phía server!",
    });
  }
});


// ROUTER POST LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    // Kiểm tra
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tất cả thông tin !",
      });
  
    try {
      // kiểm tra tài khoản
      const user = await User.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
  
      // tìm kiếm user
      const passwordValid = await argon2.verify(user.password, password);
      if (!passwordValid)
        return res
          .status(400)
          .json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
  
      const expiresIn = "30d";
  
      // khai bao jsonwebtoken
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn }
      );
  
      res.json({
        success: true,
        message: "Đăng Nhập Thành Công!",
        accessToken,
        userId: user._id,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
    }
  });

module.exports = router;
