const User = require("../models/User");
// Hàm kiểm tra quyền Admin
const checkAdmin = async (req, res, next) => {
	try {
	  const user = await User.findById(req.userId);
	  if (!user || !user.isAdmin) {
		return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
	  }
	  next();
	} catch (error) {
	  console.log(error);
	  res.status(500).json({ success: false, message: "Lỗi từ phía server !" });
	}
  };


  module.exports = checkAdmin;