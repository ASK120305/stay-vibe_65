import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
  getMyBookings,
  getBookingStats
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateBooking, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Protected routes - all booking routes require authentication
router.use(protect);

// Guest routes
router.get('/my-bookings', getMyBookings);
router.post('/', validateBooking, createBooking);
router.get('/:id', validateObjectId, getBooking);
router.put('/:id', validateObjectId, updateBooking);
router.patch('/:id/cancel', validateObjectId, cancelBooking);

// Manager and Admin routes
router.get('/', authorize('manager', 'admin'), validatePagination, getBookings);
router.patch('/:id/check-in', authorize('manager', 'admin'), validateObjectId, checkInBooking);
router.patch('/:id/check-out', authorize('manager', 'admin'), validateObjectId, checkOutBooking);
router.get('/stats/overview', authorize('manager', 'admin'), getBookingStats);

export default router;