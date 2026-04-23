import express from "express";
import { stripe } from "../config/stripe.js";

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { item } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: item.title,
              images: [item.image],
            },
            unit_amount: item.totalPrice * 100,
          },
          quantity: 1,  
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,

      metadata: {
        foodId: item.foodId,
        sellerId: item.sellerId,
        buyerId: item.buyerId,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        deliveryMethod: item.deliveryMethod,
        deliveryCharge: item.deliveryCharge,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
