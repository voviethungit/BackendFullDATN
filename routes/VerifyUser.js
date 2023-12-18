const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
const argon2 = require("argon2");
require("../models/VerifyUser");
const VerifyUser = mongoose.model("VerifyUser");
const checkAdmin = require("../middleware/checkAdmin");
const multer = require("multer");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}

router.get("/get-all-gplx", verifyToken, checkAdmin, async (req, res) => {
  try {
    const verifyUsers = await VerifyUser.find();
    res.json(verifyUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/get-gplx/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "UserId không hợp lệ" });
    }

    const verifyUser = await VerifyUser.findOne({ userId: userId });

    if (!verifyUser) {
      return res.status(404).json({ message: "Không tìm thấy VerifyUser" });
    }

    res.json(verifyUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post(
  "/create-gplx/:userId",
  upload.single("hinhAnhGiayPhep"),
  verifyToken,
  async (req, res) => {
    const userId = req.params.userId;
    const verifyUser = new VerifyUser({
      userId: userId,
      soGPLX: req.body.soGPLX,
      hoTen: req.body.hoTen,
      ngaySinh: req.body.ngaySinh,
      hinhAnhGiayPhep: "",
    });

    let imageUrl = "";

    try {
      if (req.file) {
        const bucket = admin.storage().bucket();
        const imageFileName = `${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(imageFileName);

        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        blobStream.on("error", (error) => {
          console.error(error);
          return res.status(500).json({
            success: false,
            message: "Lỗi khi tải ảnh lên Firebase Storage!",
          });
        });

        blobStream.on("finish", async () => {
          try {
            imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`;
            verifyUser.hinhAnhGiayPhep = imageUrl;

            const newVerifyUser = await verifyUser.save();
            res.status(201).json(newVerifyUser);
          } catch (error) {
            console.error(error);
            res
              .status(500)
              .json({
                success: false,
                message: "Lỗi từ phía server khi tạo VerifyUser!",
              });
          }
        });

        blobStream.end(req.file.buffer);
      } else {
        const newVerifyUser = await verifyUser.save();
        res.status(201).json(newVerifyUser);
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;
