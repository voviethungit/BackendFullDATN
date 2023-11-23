require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const authRouter = require("./routes/Auth");
const carRouter = require("./routes/Car");
const userRouter = require("./routes/User");
const reviewRouter = require("./routes/Review");
const avatarRouter = require("./routes/Image");
const blogRouter = require("./routes/Blog");
// Khai báo database
const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pv6rkef.mongodb.net/GOODCAR?retryWrites=true&w=majority`
    );
    console.log("Connect DB Thanh Cong");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
connectDB();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));


// API AUTH
app.use("/", authRouter);

// API CAR
app.use("/", carRouter);

// API USER DETAILS
app.use("/", userRouter);

// API COMMENT
app.use("/", reviewRouter);

//API AVATAR USER
app.use("/", avatarRouter);

// API BLOG
app.use("/", blogRouter);

// API SERVER
app.listen(process.env.PORT, () => {
  console.log(
    `Server dang chay tai PORT : http://localhost:${process.env.PORT}/`
  );
});
