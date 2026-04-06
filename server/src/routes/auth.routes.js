import { Router } from 'express';
import {
  linkedinCallback,
  linkedinLogin,
  linkedinMe,
} from '../services/linkedin/auth/linkedinAuth.service.js';

const router = Router();

router.get('/linkedin', linkedinLogin);
router.get('/linkedin/callback', linkedinCallback);
router.get('/linkedin/me', linkedinMe);

export default router;
