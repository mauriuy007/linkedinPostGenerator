import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorUsername: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
});
