import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email?: string;
  mobileNumber?: string;
  role: "student" | "driver" | "visitor";
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  mobileNumber: {
    type: String,
    required: function () {
      return this.role === "driver" || this.role === "visitor";
    },
    unique: true,
  },
  role: {
    type: String,
    enum: ["student", "driver", "visitor"],
    required: true,
  },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
