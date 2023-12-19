require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require('crypto');
const mongoose = require("mongoose");
const logger = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const authRouter = require("./routes/Auth");
const carRouter = require("./routes/Car");
const userRouter = require("./routes/User");
const reviewRouter = require("./routes/Review");
const blogRouter = require("./routes/Blog");
const categoryRouter = require("./routes/Category");
const paymentRouter = require("./routes/Payment");
const billRouter = require("./routes/Bill");
const verifyUserRouter = require("./routes/VerifyUser");
const countRouter = require("./routes/CountDev");
const rentRouter = require("./routes/RentCar");
const customerRouter = require("./routes/Customer");
const favotireRouter = require("./routes/Favorite");
const hungdevRouter = require("./routes/AccountBalance");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
metadata: {
  firebaseStorageDownloadTokens: uuid;
}
const initializeFirebase = require('./firebase/firebase_confighungdev');
initializeFirebase();
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
app.set('view engine', 'ejs');

app.use(express.json());
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));



// API AUTH
app.use("/", authRouter);

// API CAR
app.use("/", carRouter);

// API USER DETAILS
app.use("/", userRouter);

// API COMMENT
app.use("/", reviewRouter);

// API COUNT
app.use("/", countRouter);


// API RENT
app.use("/", rentRouter);

// API CUSTOMER
app.use("/", customerRouter);

// API BLOG
app.use("/", blogRouter);

// API CATEGORY
app.use("/", categoryRouter);

// API THANH TOAN VNPAY
app.use("/", paymentRouter);

// API HOA DON
app.use("/", billRouter);


// API Xe Yeu Thich
app.use("/", favotireRouter);

// API GPLX
app.use("/", verifyUserRouter);

app.use("/", hungdevRouter);
// API SERVER
app.listen(process.env.PORT, () => {
  console.log(
    `Server dang chay tai PORT : http://localhost:${process.env.PORT}/`
  );
  console.log("Hung Developer x 5AESieuNhan");
});