import express from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  markReviewHelpful,
  reportReview,
  approveReview,
  rejectReview,
  addHotelResponse
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateReview, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, getReviews);
router.get('/:id', validateObjectId, getReview);

// Protected routes
router.use(protect);

// Guest routes
router.get('/my-reviews', getMyReviews);
router.post('/', validateReview, createReview);
router.put('/:id', validateObjectId, validateReview, updateReview);
router.delete('/:id', validateObjectId, deleteReview);
router.patch('/:id/helpful', validateObjectId, markReviewHelpful);
router.patch('/:id/report', validateObjectId, reportReview);

// Manager and Admin routes
router.patch('/:id/approve', authorize('manager', 'admin'), validateObjectId, approveReview);
router.patch('/:id/reject', authorize('manager', 'admin'), validateObjectId, rejectReview);
router.post('/:id/response', authorize('manager', 'admin'), validateObjectId, addHotelResponse);

export default router;