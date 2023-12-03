const admin = require("firebase-admin");
const serviceAccount = require("./SDK_HungDev.json");

const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "xetotdanang.appspot.com/",
      databaseURL: "https://xetotdanang-default-rtdb.firebaseio.com"
    });
  } catch (error) {
    console.error('Firebase app initialization error:', error.stack);
  }
};

module.exports = initializeFirebase;