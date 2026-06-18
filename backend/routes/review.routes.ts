import express from 'express';
import { createReview, getServiceReviews } from '../controllers/review.controller';
import { checkDB, authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', checkDB, authenticateToken, createReview);
router.get('/service/:serviceId', checkDB, getServiceReviews);

export default router;
