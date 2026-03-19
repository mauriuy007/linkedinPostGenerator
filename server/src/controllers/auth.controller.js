import {User} from '../models/User.js';
import { UserError } from '../errors/UserError.js';
import {generateToken} from '../utils/jwtGenerator.js';

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const token = generateToken( new User({ username, password }) );
    res.status(200).json({
        message: 'Login successful',
        token
    });
  }
  catch(error) {
    if (error instanceof UserError) {
      res.status(error.statusCode).json({ message: error.message });
}}}


export const register = async (req, res) => {
  const { username, password, email } = req.body;
  try {

    User.validateUsername(username);
    User.validatePassword(password);
    User.validateEmail(email);
    res.json({
    message: 'Login endpoint working',
    username,
    email,
    password
    });
}
catch (error) {
  if (error instanceof UserError) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
}
}
