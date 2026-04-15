const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getDeliveryAgentDashboard,
  acceptOrder,
  rejectOrder,
  updateDeliveryStatus,
  getMyDeliveries,
  getProfile,
  updateProfile
} = require("../controllers/AgentController");

// Delivery Agent Dashboard (Agent only)
router.get("/dashboard", authMiddleware, roleMiddleware(["partner"]), getDeliveryAgentDashboard);

// Assign/Status logic (Agent only)
router.put("/accept/:orderId", authMiddleware, roleMiddleware(["partner"]), acceptOrder);
router.put("/reject/:orderId", authMiddleware, roleMiddleware(["partner"]), rejectOrder);

// Status update (Agent and Admin) - Reconciled with orderRoutes
router.put("/status/:orderId", authMiddleware, roleMiddleware(["partner", "admin"]), updateDeliveryStatus);

// History (Agent only)
router.get("/my-deliveries", authMiddleware, roleMiddleware(["partner"]), getMyDeliveries);

// Profile (Agent only)
router.get("/profile", authMiddleware, roleMiddleware(["partner"]), getProfile);
router.put("/profile", authMiddleware, roleMiddleware(["partner"]), updateProfile);

module.exports = router;
