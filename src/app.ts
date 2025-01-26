import express from "express";
import authRoutes from "./routes/auth";
import leadRoutes from "./routes/lead";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/api", leadRoutes);

export default app;
