const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
const argon2 = require("argon2");
require("../models/User");
const User = mongoose.model("User");
const checkAdmin = require("../middleware/checkAdmin");
const multer = require("multer");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "voviethung.tk@gmail.com", 
    pass: "capa wnzi xpnh ejwz",
  },
});

//API GET ALL USER
router.get("/getAllUser", verifyToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: { $ne: true } }).select("-password");;
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API GET USERDetail
router.get("/getProfile", verifyToken, async (req, res) => {
  try {
   
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.put("/edit-user/:id", upload.single("image"), verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Không tìm thấy user ID" });
    }

    const userDataToUpdate = {};

    if (req.body.fullName) {
      userDataToUpdate.fullName = req.body.fullName;
    }
    if (req.body.email) {
      userDataToUpdate.email = req.body.email;
    }
    if (req.body.location) {
      userDataToUpdate.location = req.body.location;
    }
    if (req.body.birthDay) {
      userDataToUpdate.birthDay = req.body.birthDay;
    }
    if (req.body.linkFB) {
      userDataToUpdate.linkFB = req.body.linkFB;
    }

    let imageUrl = "";
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
          userDataToUpdate.avatar = imageUrl; 

          const updatedUser = await User.findByIdAndUpdate(
            userId,
            userDataToUpdate,
            { new: true }
          );

          if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Không tìm thấy user" });
          }

          res.json({ success: true, message: "Cập nhật thông tin người dùng thành công", user: updatedUser });
        } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, message: "Lỗi từ phía server khi cập nhật thông tin người dùng!" });
        }
      });

      blobStream.end(req.file.buffer);
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        userDataToUpdate,
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "Không tìm thấy user" });
      }

      res.json({ success: true, message: "Cập nhật thông tin người dùng thành công", user: updatedUser });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server ! Click vào link để được hỗ trợ: https://www.facebook.com/VoVietHung.IT" });
  }
});

// API CHANGE PASSWORD
router.put("/change-password/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const { password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await argon2.hash(password);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API DELETE USER
router.put("/delete-user/:id", verifyToken, checkAdmin, async (req, res) => {
  
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }
    if (user.status === 'banned') {
      return res.status(400).json({
        success: false,
        message: "User đã bị Ban trước đó",
      });
    }
    user.status = 'banned';
    const updatedUser = await user.save();
    res.json({
      success: true,
      message: "User đã bị cấm !",
      category: updatedUser,
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API UNBAN USER
router.put("/unban-user/:id", verifyToken, checkAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }
    if (user.status !== 'banned') {
      return res.status(400).json({
        success: false,
        message: "User chưa bị cấm trước đó",
      });
    }
    user.status = 'active';
    const updatedUser = await user.save();
    res.json({
      success: true,
      message: "User đã được mở cấm!",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});
router.post('/update_balance', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.accountBalance += parseFloat(amount); 

    await user.save();

    return res.status(200).json({ message: 'Account balance updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng với email này" });
    }

    // Tạo token reset password
    const resetToken = jwt.sign({ _id: user._id }, "hdasdksakdsakdjasjdaskaksd222231312", {
      expiresIn: "1h",
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: "voviethung.tk@gmail.com",
      to: email,
      subject: "Xe Tốt - Quên Mật Khẩu",
      html: `<p>Chào bạn, Xe Tốt Gửi Bạn Các Bước Để Lấy Lại Mật Khẩu !</p>
             <p>Bước 1 : Vui lòng nhấn vào <a href="${resetLink}">đây</a> để reset mật khẩu.</p>
             <p>Bước 2 : Khi click vào liên kết trên sẽ hiển thị nhập mật khẩu mới và bấm xác nhận !</p>
             <p>Lưu ý : Link sẽ hết hạn sau 1 giờ.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi gửi email" });
      }
      console.log("Email sent: " + info.response);
      res.json({ success: true, message: "Email đã được gửi để reset mật khẩu" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});
router.post("/reset-password/:token", async (req, res) => {
  try {
    const resetToken = req.params.token;
    const { newPassword } = req.body;

    jwt.verify(resetToken, "hdasdksakdsakdjasjdaskaksd222231312", async (err, decoded) => {
      if (err) {
        return res.status(400).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
      }

      const user = await User.findById(decoded._id);

      if (!user) {
        return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
      }

      const hashedPassword = await argon2.hash(newPassword);
      user.password = hashedPassword;
      await user.save();

      res.json({ success: true, message: "Mật khẩu đã được cập nhật thành công" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});
module.exports = router;
