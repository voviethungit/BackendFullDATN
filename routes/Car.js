const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Category");
require("../models/Car");
const Car = mongoose.model("Car");
const Category = mongoose.model("Category");
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
router.post(
  "/upload-car",
  upload.single("image"),
  verifyToken,
  checkAdmin,
  async (req, res) => {
    const {
      title,
      description,
      price,
      location,
      imagePath,
      image1,
      image2,
      image3,
      tax,
      usage,
      flash,
      star,
      tax2,
      model,
      chair
    } = req.body;
    if (!title || !description || !price || !location || !model)
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ các thông tin !",
      });

    try {
      const category = await Category.findOne({ model });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy category",
        });
      }

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
        image1,
        image2,
        image3,
        chair,
        categoryID: category._id,
        categoryModel: category.model,
      });

      await newCar.save();

      res.json({ success: true, message: "THANH CONG!", car: newCar });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
    }
  }
);

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
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy xe" });
    }
    res.json({ success: true, car });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server! Liên Hệ Admin" });
  }
});


// API EDIT CAR
router.put("/update-car/:id", verifyToken, checkAdmin, async (req, res) => {
  const carId = req.params.id; 

  const {
    title,
    description,
    price,
    location,
    imagePath,
    image1,
    image2,
    image3,
    tax,
    usage,
    flash,
    star,
    tax2,
    chair,
    model,
  } = req.body;

  try {
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe",
      });
    }

    car.title = title || car.title;
    car.description = description || car.description;
    car.price = price || car.price;
    car.location = location || car.location;
    car.imagePath = imagePath || car.imagePath;
    car.image1 = image1 || car.image1;
    car.image2 = image2 || car.image2;
    car.image3 = image3 || car.image3;
    car.tax = tax || car.tax;
    car.usage = usage || car.usage;
    car.flash = flash || car.flash;
    car.star = star || car.star;
    car.tax2 = tax2 || car.tax2;
    car.model = model || car.model;
    car.chair = chair || car.chair;

  
    const updatedCar = await car.save();

    res.json({
      success: true,
      message: "Thông tin của xe đã được cập nhật",
      car: updatedCar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});

// API DELETE CAR
router.put("/delete-car/:id", verifyToken, checkAdmin, async (req, res) => {
  const carId = req.params.id;

  try {
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe",
      });
    }

    if (car.status === 'deleted') {
      return res.status(400).json({
        success: false,
        message: "Xe đã được đánh dấu là đã xóa trước đó",
      });
    }

    car.status = 'deleted';

    const updatedCar = await car.save();

    res.json({
      success: true,
      message: "Xe đã được đánh dấu là đã xóa",
      car: updatedCar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server" });
  }
});


module.exports = router;
