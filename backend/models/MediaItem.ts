import mongoose from "mongoose";

const mediaItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["movie", "tv", "book", "game"],
      required: true,
    },
    status: {
      type: String,
      enum: ["backlog", "in progress", "completed"],
      default: "backlog",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const MediaItem = mongoose.model("MediaItem", mediaItemSchema);

export default MediaItem;
