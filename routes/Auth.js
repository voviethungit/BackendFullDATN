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
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}

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


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/register", upload.single("image"), async (req, res) => {
  const { fullName, password, email, location, phoneNumber } = req.body;

  if (!fullName || !password || !email || !phoneNumber || !location) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin!",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đã tồn tại",
      });
    }

    let imageUrl = "";
    if (req.file) {
      const bucket = admin.storage().bucket();
      const imageFileName = `${Date.now()}_${req.file.originalname}`;
      const fileUpload = bucket.file(imageFileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
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

          const hashedPassword = await argon2.hash(password);

          const newUser = new User({
            fullName,
            password: hashedPassword,
            email,
            phoneNumber,
            location,
            avatar: imageUrl,
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
          return res.status(500).json({
            success: false,
            message: "Lỗi từ phía server khi lưu thông tin người dùng!",
          });
        }
      });
      blobStream.end(req.file.buffer);
    } else {
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
    }
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

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị cấm truy cập!" });
    }
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
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
  }
});

module.exports = router;
