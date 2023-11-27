const express = require('express');
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('../firebase/SDK_HungDev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'images-87aa0.appspot.com',
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-avatar', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn ảnh để tải lên!',
    });
  }

  try {
    const bucket = admin.storage().bucket();
    const imageFileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(imageFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải ảnh lên Firebase Storage!',
      });
    });

    blobStream.on('finish', () => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}`;
      res.json({
        success: true,
        imageUrl: imageUrl,
        message: 'Tải ảnh lên thành công!',
      });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi từ phía server!',
    });
  }
});

module.exports = router;
