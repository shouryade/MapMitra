import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log("MongoDB connected");
    // console.log("Connection Instance:", connectionInstance);
  } catch (error) {
    console.error("MongoDB connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
