const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
require("../models/Review");
const Review = mongoose.model("Review");

// API COMMENT 
router.post("/review-car", verifyToken, async (req, res) => {
    const { content } = req.body;
    if (!content)
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập nội dung !" });
  
    try {
      const newReview = new Review({
        content,
        userReview: req.userId,
        Car: req.carId
      });
  
      await newReview.save();
  
      res.json({ success: true, message: "THANH CONG!", review: newReview });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
    }
  });
  

  module.exports = router;
