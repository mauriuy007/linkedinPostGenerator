import { Router } from 'express';
import {
  linkedinLogin,
  linkedinCallback,
  linkedinMe,
} from '../controllers/authController.js';

const router = Router();

router.get('/linkedin',linkedinLogin);
router.get('/linkedin/callback',linkedinCallback);
router.get('/linkedin/me',linkedinMe);
router.get('/instagram',instagramLogin)

export default router;
