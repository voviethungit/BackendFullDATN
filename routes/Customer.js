const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Customer");
require("../models/Car");
const Customer = mongoose.model("Customer");
const Car = mongoose.model("Car");
const verifyToken = require("../middleware/auth");
const checkAdmin = require("../middleware/checkAdmin");

router.post("/create-customer", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { fullName, nameCar, status, amount, Date, isDelete, location } = req.body;
    const newCustomer = new Customer({
      fullName,
      location,
      nameCar,
      status,
      isDelete,
      amount,
      Date,
    });
    await newCustomer.save();
    res.status(201).json({ message: "Khách hàng đã được tạo thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo khách hàng",
      error: error.message,
    });
  }
});

router.get("/get-customer", verifyToken, checkAdmin, async (req, res) => {
  try {
    const customers = await Customer.find({ isDelete: { $ne: 'deleted' } });
    res.status(200).json({ customers });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách khách hàng",
      error: error.message,
    });
  }
});

router.get("/get-customer/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.status(200).json({ customer });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy thông tin khách hàng",
      error: error.message,
    });
  }
});

router.put(
  "/delete-customer/:id",
  verifyToken,
  checkAdmin,
  async (req, res) => {
    const customerId = req.params.id;
    try {
      const customer = await Customer.findById(customerId);
  
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy Khách Hàng",
        });
      }
      if (customer.isDelete === 'deleted') {
        return res.status(400).json({
          success: false,
          message: "Khách Hàng đã được đánh dấu là đã xóa trước đó",
        });
      }
      customer.isDelete = 'deleted';
      const updatedCustomer = await customer.save();
      res.json({
        success: true,
        message: "Khách Hàng đã được đánh dấu là đã xóa",
        category: updatedCustomer,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi từ phía server" });
    }
  }
);

router.put("/edit-customer/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const customerId = req.params.id;
    const { fullName, location, car, status, amount, Date } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { fullName, car, status, amount, Date, location },
      { new: true }
    );
    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khách hàng để cập nhật" });
    }
    res.status(200).json({
      message: "Thông tin khách hàng đã được cập nhật",
      updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật thông tin khách hàng",
      error: error.message,
    });
  }
});

module.exports = router;
