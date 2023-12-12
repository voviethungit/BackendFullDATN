const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
require("../models/Car");
const Car = mongoose.model("Car");
const User = mongoose.model("User");
const RentalHistory = require("../models/RentalHistory");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

router.post("/rent-car/:userId/:carId", async (req, res) => {
  const userId = req.params.userId;
  const carId = req.params.carId;

  try {
    const user = await User.findById(userId);
    const car = await Car.findById(carId);

    if (!user || !car) {
      return res
        .status(404)
        .json({
          message: "Không tìm thấy thông tin người dùng hoặc thông tin xe",
        });
    }

    if (user.accountBalance >= car.price) {
      const rentalRecord = new RentalHistory({
        userId: userId,
        carId: carId,
        fullName: user.fullName,
        location: user.location,
        title: car.title,
        price: car.price,
        rentedAt: new Date(),
      });

      user.accountBalance -= car.price;
      await user.save();

      await rentalRecord.save();
      car.isAvailable = false;
      await car.save();
      return res.status(200).json({ message: "Thành Công !", rentalRecord });
    } else {
      return res.status(400).json({ message: "Số dư không đủ để thuê xe" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/rental-history/:userId", verifyToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const rentalRecords = await RentalHistory.find({ userId: userId });

    if (!rentalRecords || rentalRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch sử thuê cho người dùng này" });
    }

    res.status(200).json({ rentalRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/rental-history", verifyToken, checkAdmin, async (req, res) => {
  try {
    const rentalRecords = await RentalHistory.find();

    res.status(200).json({ rentalRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.put("/rental-history/:id", verifyToken, checkAdmin, async (req, res) => {
  const rentalHistoryId = req.params.id;
  const updatedInfo = req.body;

  try {
    const rentalRecord = await RentalHistory.findByIdAndUpdate(
      rentalHistoryId,
      updatedInfo,
      { new: true }
    );

    if (!rentalRecord) {
      return res.status(404).json({ message: "404 NOT FOUND" });
    }

    res
      .status(200)
      .json({
        message: "Cập nhật thông tin hoá đơn thành công!",
        rentalRecord,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.put(
  "/delete-rental-history/:id",
  verifyToken,
  checkAdmin,
  async (req, res) => {
    const rentalHistoryId = req.params.id;
    try {
      const rentalhistory = await RentalHistory.findById(rentalHistoryId);
  
      if (!rentalhistory) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy Lịch Sử Thuê",
        });
      }
  
      if (rentalhistory.isDelete === "deleted") {
        return res.status(400).json({
          success: false,
          message: "LỊCH SỬ THUÊ đã được đánh dấu là đã xóa trước đó",
        });
      }
  
      rentalhistory.isDelete = "deleted";
  
      const updaterental = await rentalhistory.save();
  
      res.json({
        success: true,
        message: "LỊCH SỬ THUÊ đã được đánh dấu là đã xóa",
        rentalhistory: updaterental,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server" });
    }
  }
);

module.exports = router;
