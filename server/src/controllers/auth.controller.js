import {User} from '../models/User.js';
import { UserError } from '../errors/UserError.js';
import {generateToken} from '../utils/jwtGenerator.js';
import {User as UserModel} from '../mongoose/schemas/user.schema.js';

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const token = generateToken(new User({ username, password }));

    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    if (error instanceof UserError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const register = async (req, res) => {
  const { username, password: rawPassword, passoword, email } = req.body ?? {};
  const password = rawPassword ?? passoword;

  try {
    console.log('Received registration data:', {
      contentType: req.headers['content-type'],
      body: req.body,
      username,
      email,
      password
    });
    User.validateUsername(username);
    User.validatePassword(password);
    User.validateEmail(email);
    const user = await UserModel.createUser({ username, password, email });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    if (error instanceof UserError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    if (error?.name === 'MongooseError' || error?.name === 'MongoServerError') {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    console.error('Register failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
