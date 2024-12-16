import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["student", "visitor", "driver", "admin"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
