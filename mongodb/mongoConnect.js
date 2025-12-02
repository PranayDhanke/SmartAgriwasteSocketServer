// mongodb/mongoConnect.js
import { configDotenv } from "dotenv";
import mongoose from "mongoose";

configDotenv();

const uri = process.env.MONGO_URI ;

if (!uri) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

export default async function mongoConnect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(uri, {});
  return mongoose.connection;
}
