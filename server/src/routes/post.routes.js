import { Router } from 'express';
import { requestPost } from '../controllers/postController.js';

const router = Router();

router.post('/create', requestPost);

export default router;
