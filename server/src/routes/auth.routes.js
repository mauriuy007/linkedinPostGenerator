import { Router } from 'express';
import {
  linkedinCallback,
  linkedinLogin,
} from '../services/linkedin/auth/linkedinAuth.service.js';

const router = Router();

router.get('/linkedin', linkedinLogin);
router.get('/linkedin/callback', linkedinCallback);

export default router;
