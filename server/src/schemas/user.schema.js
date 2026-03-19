import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});