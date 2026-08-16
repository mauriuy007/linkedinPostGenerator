import { Router } from 'express';
import {
  publishPost,
  requestPost,
  publishInstagramPost,
  createMediaUploadToken,
} from '../controllers/postController.js';

const router = Router();

router.post('/create', requestPost);
router.post('/publish', publishPost);
router.post('/publish/instagram', publishInstagramPost);
router.post('/media/upload-url', createMediaUploadToken);

export default router;
