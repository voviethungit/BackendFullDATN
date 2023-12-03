const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Car = require('../models/Car');
const Category = require('../models/Category');
router.get('/countAll', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCars = await Car.countDocuments();
    const totalCategories = await Category.countDocuments();
    res.json({ totalUsers, totalCars, totalCategories });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông tin thống kê' });
  }
});

module.exports = router;
