import { Router } from 'express';
import { publishPost, requestPost } from '../controllers/postController.js';

const router = Router();

router.post('/create', requestPost);
router.post('/publish', publishPost);

export default router;
