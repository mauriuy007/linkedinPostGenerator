import { Router } from 'express';
import {
  linkedinLogin,
  linkedinCallback,
  linkedinMe,
  linkedinLogout,
  instagramLogin,
  instagramCallback,
  instagramMe,
  instagramLogout,
} from '../controllers/authController.js';

const router = Router();

router.get('/linkedin',linkedinLogin);
router.get('/linkedin/callback',linkedinCallback);
router.get('/linkedin/me',linkedinMe);
router.post('/linkedin/logout', linkedinLogout);
router.get('/instagram', instagramLogin);
router.get('/instagram/callback', instagramCallback);
router.get('/instagram/me', instagramMe);
router.post('/instagram/logout', instagramLogout);

export default router;
