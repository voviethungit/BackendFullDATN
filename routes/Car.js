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
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/upload-car", verifyToken, checkAdmin, upload.fields([{ name: "imagePath", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),async (req, res) => {
    const {
      title,
      description,
      price,
      location,
      tax,
      usage,
      flash,
      star,
      categoryID,
      tax2,
      fuel,
      chair,
      model,
    } = req.body;

    if (!title || !description || !price || !location || !categoryID)
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ các thông tin!",
      });

    try {
      const images = req.files;

      if (!images || typeof images !== "object") {
        return res.status(400).json({
          success: false,
          message:
            "Không có hình ảnh được tải lên hoặc dữ liệu hình ảnh không hợp lệ",
        });
      }

      const imageUrls = await Promise.all(
        Object.keys(images).map(async (key) => {
          const bucket = admin.storage().bucket();
          const file = images[key][0];
          const imageFileName = `${Date.now()}_${file.originalname}`;
          const blob = bucket.file(imageFileName);

          const blobStream = blob.createWriteStream({
            metadata: {
              contentType: file.mimetype,
            },
          });

          return new Promise((resolve, reject) => {
            blobStream.on("error", (error) => {
              console.error(error);
              reject("Lỗi khi tải ảnh lên Firebase Storage!");
            });

            blobStream.on("finish", () => {
              const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${blob.name}?alt=media&token=${uuid}`;
              resolve(imageUrl);
            });

            blobStream.end(file.buffer);
          });
        })
      );

      const newCar = new Car({
        title,
        description,
        price,
        location,
        tax,
        usage,
        flash,
        star,
        categoryID,
        tax2,
        fuel,
        chair,
        model,
        imagePath: imageUrls[0],
        image1: imageUrls[1],
        image2: imageUrls[2],
        image3: imageUrls[3],
      });

      await newCar.save();

      res.json({ success: true, message: "THANH CONG!", car: newCar });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server!" });
    }
  }
);
// API get CAR
router.get("/get-car", async (req, res) => {
  try {
    const cars = await Car.find({ status: { $ne: "deleted" }, isAvailable: true });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API GET ID CAR
router.get("/get-car/:id", async (req, res) => {
  const carId = req.params.id;
  try {
    const car = await Car.findOne({ _id: carId, status: { $ne: "deleted" }, isAvailable: true });
    if (!car) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy xe" });
    }
    const similarCars = await Car.find({
      _id: { $ne: carId },
      categoryID: car.categoryID,
      status: { $ne: "deleted" },
      isAvailable: true,
    });
    res.json({ success: true, car, similarCars });
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
    fuel,
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
    car.fuel = fuel || car.fuel;

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

// API GET DELETED CARS
router.get("/get-deleted-cars", verifyToken, checkAdmin, async (req, res) => {
  try {
    const deletedCars = await Car.find({ status: "deleted" });
    res.json({ success: true, deletedCars });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi từ phía server!" });
  }
});

// API RESTORE CAR
router.put("/restore-car/:id", verifyToken, checkAdmin, async (req, res) => {
  const carId = req.params.id;

  try {
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe",
      });
    }

    if (car.status !== "deleted") {
      return res.status(400).json({
        success: false,
        message: "Xe chưa được đánh dấu là đã xóa",
      });
    }

    car.status = "active"; 

    const restoredCar = await car.save();

    res.json({
      success: true,
      message: "Xe đã được khôi phục",
      car: restoredCar,
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

    if (car.status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "Xe đã được đánh dấu là đã xóa trước đó",
      });
    }

    car.status = "deleted";

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
