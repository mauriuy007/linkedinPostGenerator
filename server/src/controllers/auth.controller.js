import {User} from '../models/User.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  res.status(200).json({
    message: 'Login endpoint working'
  });
}

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {

    User.validateUsername(username);
    User.validatePassword(password);
    res.json({
    message: 'Login endpoint working',
    username,
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
