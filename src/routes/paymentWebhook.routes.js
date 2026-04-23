import express from "express";
import { stripe } from "../config/stripe.js";
import bodyParser from "body-parser";
import { Order } from "../models/order.model.js";

const router = express.Router();

// Stripe requires raw body for signature verification
router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.log("Webhook signature verification failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("Payment successful for session:", session.id);

      const metadata = session.metadata;
      if (!metadata) {
        console.log("❌ Metadata missing");
        return;
      }
      console.log("Metadata:", metadata);

      await Order.create({
        foodId: metadata.foodId,
        sellerId: metadata.sellerId,
        buyerId: metadata.buyerId,
        quantity: Number(metadata.quantity),
        totalPrice: Number(metadata.totalPrice),
        paymentMethod: "online payment",
        paymentStatus: "paid",
        deliveryMethod: metadata.deliveryMethod,
        deliveryCharge: Number(metadata.deliveryCharge),
        status: "pending",
      });

      console.log("Order created successfully for session:", session.id);
    }

    res.json({ received: true });
  },
);

export default router;
