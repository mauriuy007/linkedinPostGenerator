import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import {
  linkedinCallback,
  linkedinLogin,
} from '../services/linkedin/auth/linkedinAuth.service.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/linkedin', linkedinLogin);
router.get('/linkedin/callback', linkedinCallback);

export default router;
