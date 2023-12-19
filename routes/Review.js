const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Review = require('../models/Review');
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
require("../models/User");
const User = mongoose.model("User");
require("../models/Car");
const Car = mongoose.model("Car");
router.post('/reviews',verifyToken, async (req, res) => {
  try {

    
    const { userId, carId, rating, reviewText } = req.body; 
    const user = await User.findById(userId);
    const car = await Car.findById(carId);
    if (!user || !car) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const newReview = new Review({
      fullName: user.fullName,
      avatar: user.avatar,
      user: userId,
      car: carId,
      rating: rating,
      reviewText: reviewText
    });


    const savedReview = await newReview.save();

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find(); 
    res.status(200).json(reviews); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/reviews/:carId', async (req, res) => {
  const carId = req.params.carId;
  try {
    const reviews = await Review.find({ car: carId });
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this car' });
    }
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/reviews/:id',verifyToken, checkAdmin, async (req, res) => {
  try {
    const { rating, reviewText } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: rating, reviewText: reviewText },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/delete-reviews/:id', verifyToken, checkAdmin, async (req, res) => {
  const reviewId = req.params.id;
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận",
      });
    }

    if (review.status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "bình luận đã được đánh dấu là đã xóa trước đó",
      });
    }

    review.status = "deleted";

    const updatedreview = await review.save();

    res.json({
      success: true,
      message: "Bình luận đã được đánh dấu là đã xóa",
      car: updatedreview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});

module.exports = router;