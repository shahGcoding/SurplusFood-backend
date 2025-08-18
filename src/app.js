import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN, credentials: true,}));

app.use(express.json({limit: "16kb", }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

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


export { app }; // we can also use export default app
