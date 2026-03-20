import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserError } from "../../errors/UserError.js";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.statics.createUser = async function ({ username, password, email }) {
  const existingUser = await this.findOne({ username });

  if (existingUser) {
    throw new UserError('Username already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await this.create({
    username,
    password: hashedPassword,
    email,
  });

  return user;
};

export const User = mongoose.model('User', userSchema);
