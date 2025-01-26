import mongoose from "mongoose";

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI!;
  await mongoose.connect(mongoUri, {
    dbName: process.env.DB_NAME,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
