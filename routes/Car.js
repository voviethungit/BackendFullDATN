const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Car");
const Car = mongoose.model("Car");
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");
// API UPLOAD CAR
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });
router.post("/upload-car", upload.single("image"), verifyToken, async (req, res) => {
  const { title, description, price, location, numberCar } = req.body;
  const imagePath = req.file.filename;
  if (!title || !description || !price || !location || !numberCar)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ các thông tin !" });

  try {
    const newCar = new Car({
      title,
      description,
      price,
      location,
      imagePath,
      tax,
      usage,
      flash,
      star,
      tax2,
      userPost: req.userId,
    });

    await newCar.save();

    res.json({ success: true, message: "THANH CONG!", car: newCar });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
  }
});


// API get CAR
router.get("/get-car", async (req, res) => {
  try {
    const cars = await Car.find({});
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API GET ID CAR
router.get("/get-car/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Không tìm thấy xe" });
    }
    res.json({ success: true, car });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi Server! Liên Hệ Admin" });
  }
});
module.exports = router;
