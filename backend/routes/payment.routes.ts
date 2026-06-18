import express from 'express';
import { createCheckoutSession, verifyCheckoutSession } from '../controllers/payment.controller';
import { checkDB, authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/create-checkout-session', checkDB, authenticateToken, createCheckoutSession);
router.get('/checkout-session/:sessionId', checkDB, authenticateToken, verifyCheckoutSession);

export default router;
