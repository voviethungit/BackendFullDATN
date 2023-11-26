const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Bill");
const Bill = mongoose.model("Bill");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

// API TAO BILL
router.post("/create-bill", verifyToken, async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    const savedBill = await newBill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo Bill", error: error.message });
  }
});

// API GET BILL
router.get("/get-all-bill", verifyToken, checkAdmin, async (req, res) => {
  try {
    const allBills = await Bill.find();
    res.json(allBills);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy tất cả Bills", error: error.message });
  }
});

// API GET BILL CU THE 
router.get("/get-bill/:id", verifyToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Không tìm thấy Bill" });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin Bill", error: error.message });
  }
});

// API XOA BILL
router.delete("/delete-bill/:id",verifyToken, checkAdmin, async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (!deletedBill) {
      return res.status(404).json({ message: "Không tìm thấy Bill để xóa" });
    }
    res.json({ message: "Bill đã được xóa", deletedBill });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa Bill", error: error.message });
  }
});

module.exports = router;
