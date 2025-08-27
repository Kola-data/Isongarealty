import express from 'express';
import {db} from '../../db.js';
import { checkPassword } from '../../utils/pwdHandle.js';
import { generateToken } from '../../utils/token.js';

const authRouter = express.Router();

// Middleware to validate user credentials
const validateUserCredentials = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await checkPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    console.error('Error validating user credentials:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Login route
authRouter.post('/login', validateUserCredentials, (req, res) => {
  try {
    const { id, name, email } = req.user;

    // Generate JWT token
    const token = generateToken({ id, name, email });

    res.status(200).json({
      message: 'Login successful',
      user: { id, name, email },
      token
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default authRouter;
