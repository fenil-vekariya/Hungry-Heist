const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {

    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

const uploadRestaurantImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

const uploadMenuItemImage = upload.single("image");

module.exports = {
  uploadRestaurantImages,
  uploadMenuItemImage,
};
