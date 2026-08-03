import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    authProvider: {
      type: String,
      enum: ["google", "development"],
      required: true,
    },
    googleSub: { type: String, unique: true, sparse: true, index: true },
    developmentKey: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
