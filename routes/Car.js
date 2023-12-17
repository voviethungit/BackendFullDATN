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
router.put("/update-car/:id", verifyToken, checkAdmin, upload.fields([
  { name: "imagePath", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
]), async (req, res) => {
  const carId = req.params.id;

  try {
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe",
      });
    }

    const images = req.files;

    const updateFields = {
      // Lấy các trường thông tin xe khác từ req.body
      title: req.body.title || car.title,
      description: req.body.description || car.description,
      price: req.body.price || car.price,
      location: req.body.location || car.location,
      tax: req.body.tax || car.tax,
      usage: req.body.usage || car.usage,
      flash: req.body.flash || car.flash,
      star: req.body.star || car.star,
      tax2: req.body.tax2 || car.tax2,
      fuel: req.body.fuel || car.fuel,
      chair: req.body.chair || car.chair,
      model: req.body.model || car.model,
    };

    // Hàm upload ảnh lên Firebase Storage và cập nhật đường dẫn ảnh trong cơ sở dữ liệu
    const uploadAndUpdate = async (key) => {
      if (images[key] && images[key][0]) {
        const bucket = admin.storage().bucket();
        const image = images[key][0];
        const imageFileName = `${Date.now()}_${image.originalname}`;
        const fileUpload = bucket.file(imageFileName);

        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: image.mimetype,
          },
        });

        await new Promise((resolve, reject) => {
          blobStream.on("error", (error) => {
            console.error(error);
            reject("Lỗi khi tải ảnh lên Firebase Storage!");
          });

          blobStream.on("finish", async () => {
            // Lấy đường dẫn URL của ảnh đã upload lên Firebase Storage
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`;
            updateFields[key] = imageUrl;

            resolve();
          });

          blobStream.end(image.buffer);
        });
      }
    };

    // Gọi hàm upload cho từng ảnh
    const imageKeys = ["imagePath", "image1", "image2", "image3"];
    await Promise.all(imageKeys.map(async (key) => uploadAndUpdate(key)));

    // Cập nhật thông tin của xe trong cơ sở dữ liệu
    Object.assign(car, updateFields);
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
