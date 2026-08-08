import { Router } from 'express';
import {
  publishPost,
  requestPost,
  publishInstagramPost,
} from '../controllers/postController.js';

const router = Router();

router.post('/create', requestPost);
router.post('/publish', publishPost);
router.post('/publish/instagram', publishInstagramPost);

export default router;
