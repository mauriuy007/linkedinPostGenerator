import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const payload = {
        username: user.username,
        email: user.email
    };
    const secret = process.env.JWT_SECRET || 'defaultsecret';
    const options = {
        expiresIn: '1h'
    };
    return jwt.sign(payload, secret, options);
}