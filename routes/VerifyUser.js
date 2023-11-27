const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const verifyToken = require("../middleware/auth");
require("../models/VerifyUser");
const VerifyUser = mongoose.model("VerifyUser");
const checkAdmin = require("../middleware/checkAdmin");

// CREATE
router.post("/create-gplx", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { soGPLX, hoTen, ngaySinh, hinhAnhGiayPhep } = req.body;
    const newGiayPhep = new VerifyUser({
      soGPLX,
      hoTen,
      ngaySinh,
      userId,
      hinhAnhGiayPhep
    });
    const savedGiayPhep = await newGiayPhep.save();
    res.json({ success: true, data: savedGiayPhep });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server !" });
  }
});


// API GET GPLX
router.get("/get-gplx", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const giayPhep = await VerifyUser.findOne({ userId });
    res.json({ success: true, data: giayPhep });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server !" });
  }
});


// UPDATE GPLX
router.put("/update-gplx", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { soGPLX, hoTen, ngaySinh, hinhAnhGiayPhep } = req.body;
    let giayPhep = await VerifyUser.findOne({ userId });

    if (!giayPhep) {
      giayPhep = new VerifyUser({
        soGPLX,
        hoTen,
        ngaySinh,
        userId,
        hinhAnhGiayPhep,
      });
    } else {
      giayPhep.soGPLX = soGPLX;
      giayPhep.hoTen = hoTen;
      giayPhep.ngaySinh = ngaySinh;
      giayPhep.hinhAnhGiayPhep = hinhAnhGiayPhep;
    }

    const updatedGiayPhep = await giayPhep.save();
    res.json({ success: true, data: updatedGiayPhep });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server !" });
  }
});


// DELETE
router.delete("/delete-gplx/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const giayPhepId = req.params.id;
    const deletedGiayPhep = await VerifyUser.findByIdAndDelete(giayPhepId);
    if (!deletedGiayPhep) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy thông tin giấy phép lái xe",
        });
    }
    res.json({
      success: true,
      message: "Xóa thông tin giấy phép lái xe thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server !" });
  }
});

module.exports = router;
