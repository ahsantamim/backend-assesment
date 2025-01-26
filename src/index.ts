import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 9000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: process.env.DB_NAME,
    });
    console.log("\n".repeat(1));
    console.log("=".repeat(46));
    console.log("🚀🚀🚀 Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server connected on port ${PORT} 🚀🚀🚀`);
      console.log("=".repeat(46));
      console.log("\n".repeat(1));
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
