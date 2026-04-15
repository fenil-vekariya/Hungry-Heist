const express = require("express");
const router = express.Router();
const { body, validationResult } = require("../middleware/validator");
const { register, login, getProfile, updateProfile, updateAddress } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Diagnostic Debugging
console.log("Validator body type:", typeof body);
console.log("Register handler type:", typeof register);
console.log("Login handler type:", typeof login);
console.log("Auth middleware type:", typeof authMiddleware);

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: errors.array()[0].msg 
    });
  }
  next();
};

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["customer", "restaurant", "partner"])
    .withMessage("Invalid role selected"),
  body("vehicleType")
    .if(body("role").equals("partner"))
    .notEmpty()
    .withMessage("Vehicle type is required for delivery partners"),
  body("vehicleNumber")
    .if(body("role").equals("partner"))
    .notEmpty()
    .withMessage("Vehicle number is required for delivery partners"),
  handleValidation
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidation
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("any")
    .withMessage("Please enter a valid phone number"),
  body("newPassword")
    .optional()
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  handleValidation
];

const updateAddressValidation = [
  body("city")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("City name is too long"),
  body("pin")
    .optional()
    .trim()
    .isPostalCode("IN")
    .withMessage("Please enter a valid PIN code"),
  handleValidation
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfileValidation, updateProfile);
router.put("/address", authMiddleware, updateAddressValidation, updateAddress);

module.exports = router;
