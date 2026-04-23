import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import paymentWebhookRouter from "./routes/paymentWebhook.routes.js";
// stripe payment routes
import paymentCheckoutRouter from "./routes/paymentCheckout.route.js";

const app = express();
 
//app.use(cors({origin: "http://localhost:5173", credentials: true,}));
app.use(cors({origin: process.env.CLIENT_URL, credentials: true,}));

app.use("/api/v1/webhook", paymentWebhookRouter);

app.use(express.json({limit: "16kb", }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1/payments", paymentCheckoutRouter);

app.use(express.static("public"))
    
app.use(cookieParser())  


// import routes
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import foodRouter from "./routes/food.routes.js";
import messageRouter from "./routes/message.routes.js";
import complaintRouter from "./routes/complaint.routes.js";





// routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/foods", foodRouter);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/complaints", complaintRouter);

// stripe payment routes
app.use("/api/v1/payments", paymentCheckoutRouter);



export { app }; // we can also use export default app
