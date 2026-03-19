import { UserError } from '../errors/UserError.js';
export class User {
  constructor({ id,username, password, email = null, createdAt = new Date() }) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.createdAt = createdAt;
  }

  static validateUsername(username) {
    if (!username || username.trim().length < 3) {
      throw new UserError('Username must have at least 3 characters');
    }
  }

  static validatePassword(password) {
    if (!password || password.length < 6) {
      throw new UserError('Password must have at least 6 characters');
    }
  }

  static validateEmail(email) {
    if (email !== null && !email.includes('@')) {
      throw new UserError('Email is not valid');
    }
  }
}