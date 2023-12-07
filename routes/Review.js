const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
const User = require("../models/User");
router.post('/reviews',verifyToken, async (req, res) => {
  try {

    
    const { userId, carId, rating, reviewText, fullName } = req.body; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const newReview = new Review({
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


router.get('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id); 
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
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
    res.status(200).json(updatedReview); // Return the updated review
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete('/reviews/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;