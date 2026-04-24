const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: "Amount and system orderId are required" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${orderId}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorpay order" });
    }

    // Update the system order with the Razorpay order ID
    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: order.id,
    });

    res.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: "Missing required payment details" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSignature) {
      // Payment is verified
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Paid",
        paymentId: razorpay_payment_id,
      });

      return res.json({ message: "Payment verified successfully" });
    } else {
      // Invalid signature
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Failed",
      });
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
