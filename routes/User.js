const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
const argon2 = require("argon2");
require("../models/User");
const User = mongoose.model("User");
const checkAdmin = require("../middleware/checkAdmin");
const multer = require("multer");
const admin = require("firebase-admin");
const serviceAccount = require("../firebase/SDK_HungDev.json");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}
//API GET ALL USER
router.get("/getAllUser", verifyToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: { $ne: true } }).select("-password");;
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API GET USERDetail
router.get("/getProfile", verifyToken, async (req, res) => {
  try {
   
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// API EDIT USER
router.put("/edit-user/:id", upload.single("image"), verifyToken,  async (req, res) => {
  try {
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

          const userId = req.params.id;
          const { fullName, email, location, birthDay, linkFB, avatar } = req.body;

          if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Không tìm thấy user ID" });
          }

          const updatedUserData = {
            fullName,
            email,
            location,
            birthDay,
            linkFB,
            avatar: imageUrl,
          };

          const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatedUserData,
            { new: true } 
          );

          if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Không tìm thấy user" });
          }

          res.json({ success: true, message: "Cập nhật thông tin người dùng thành công", user: updatedUser });
        } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, message: "Lỗi từ phía server khi cập nhật thông tin người dùng!" });
        }
      });

      blobStream.end(req.file.buffer);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi Server ! Click vào link để được hỗ trợ: https://www.facebook.com/VoVietHung.IT" });
  }
});

// API CHANGE PASSWORD
router.put("/change-password/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const { password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await argon2.hash(password);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API DELETE USER
router.put("/delete-user/:id", verifyToken, checkAdmin, async (req, res) => {
  
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }
    if (user.status === 'banned') {
      return res.status(400).json({
        success: false,
        message: "User đã bị Ban trước đó",
      });
    }
    user.status = 'banned';
    const updatedUser = await user.save();
    res.json({
      success: true,
      message: "User đã bị cấm !",
      category: updatedUser,
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
