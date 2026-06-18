import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getProviderBookings, 
  updateBookingStatus,
  getBookingMessages
} from '../controllers/booking.controller';
import { checkDB, authenticateToken } from '../middleware/auth';


const router = express.Router();

router.post('/', checkDB, authenticateToken, createBooking);
router.get('/my', checkDB, authenticateToken, getMyBookings);
router.get('/provider', checkDB, authenticateToken, getProviderBookings);
router.patch('/:id/status', checkDB, authenticateToken, updateBookingStatus);
router.get('/:bookingId/messages', checkDB, authenticateToken, getBookingMessages);

export default router;
