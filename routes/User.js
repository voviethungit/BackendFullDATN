const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
const argon2 = require("argon2");
require("../models/User");
const User = mongoose.model("User");
const checkAdmin = require("../middleware/checkAdmin");

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

// API EDIT USER
router.put("/edit-user/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, email, location, phoneNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Khong tim thay user ID" });
    }

    const updatedUserData = {
      fullName,
      email,
      location,
      phoneNumber,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedUserData,
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Khong tim thay user" });
    }

    res.json({ success: true, message: "Cap Nhat Thanh Cong User", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi Server ! Click vào link để được hỗ trợ: https://www.facebook.com/VoVietHung.IT" });
  }
});

// API CHANGE PASSWORD
router.put("/change-password/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
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
router.delete("/delete-user/:userId", verifyToken, checkAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kiểm tra xem userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" });
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
