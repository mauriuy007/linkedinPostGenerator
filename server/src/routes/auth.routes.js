import { Router } from 'express';
import {
  linkedinLogin,
  linkedinCallback,
  linkedinMe,
  instagramLogin,
  instagramCallback,
  instagramMe,
} from '../controllers/authController.js';

const router = Router();

router.get('/linkedin',linkedinLogin);
router.get('/linkedin/callback',linkedinCallback);
router.get('/linkedin/me',linkedinMe);
router.get('/instagram', instagramLogin);
router.get('/instagram/callback', instagramCallback);
router.get('/instagram/me', instagramMe);

export default router;
