const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
require("../models/Car");
const Car = mongoose.model("Car");
const User = mongoose.model("User");
require("../models/Favorite");
const Favorite = mongoose.model("Favorite");
const verifyToken = require("../middleware/auth");

router.get("/favorite/:userId", verifyToken, async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const favoriteCars = await Favorite.findOne({ userId }).populate('favoriteCars');
  
      if (!favoriteCars) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin xe yêu thích của người dùng",
        });
      }
  
      res.json({
        success: true,
        favoriteCars: favoriteCars.favoriteCars,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server" });
    }
  });

router.put("/favorite/:userId/:carId", verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const carId = req.params.carId;
  
    try {
      const car = await Car.findById(carId);
      if (!car) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy xe",
        });
      }
  
      let favorite = await Favorite.findOne({ userId });
      if (!favorite) {
        favorite = new Favorite({ userId, favoriteCars: [] });
      }

      const existingCar = favorite.favoriteCars.find(favCar => favCar.toString() === carId);
      if (!existingCar) {
        favorite.favoriteCars.push(carId);
        await favorite.save();
      }
  
      res.json({
        success: true,
        message: "Đã thêm vào danh sách yêu thích",
        favorite,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server" });
    }
  });
  

module.exports = router;
