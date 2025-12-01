// mongodb/mongoConnect.js
import mongoose from "mongoose";

const uri = process.env.MONGO_URI || "mongodb+srv://pranaydhanke33_db_user:r5QczrQFM7bx1Xey@cluster0.supsrjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function mongoConnect() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(uri, {});
  return mongoose.connection;
}
