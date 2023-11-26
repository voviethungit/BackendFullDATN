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
const serviceAccount = require("../firebase/SDK_HungDev.json");


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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "images-87aa0.appspot.com",
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng chọn ảnh để tải lên!",
    });
  }

  try {
    const bucket = admin.storage().bucket();
    const imageFileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(imageFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tải ảnh lên Firebase Storage!",
      });
    });

    blobStream.on("finish", async () => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}`;

      const { fullName, password, email, location, phoneNumber } = req.body;

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
          avatar: imageUrl, 
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
          imageUrl: imageUrl,
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

    blobStream.end(file.buffer);
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
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
    }
  });

module.exports = router;
