import mongoose, { Schema, Document } from "mongoose";

interface IAuto extends Document {
  driverId: Schema.Types.ObjectId;
  autoNumber: number;
  isAvailable: boolean;
  lastUpdated: Date;
}

const AutoSchema = new Schema<IAuto>({
  driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  autoNumber: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model<IAuto>("Auto", AutoSchema);
