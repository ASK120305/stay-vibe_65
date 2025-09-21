import express from 'express';
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  uploadHotelImages,
  deleteHotelImage,
  getHotelStats,
  searchHotels,
  getNearbyHotels
} from '../controllers/hotelController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateHotel, validateObjectId, validatePagination } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, getHotels);
router.get('/search', searchHotels);
router.get('/nearby', getNearbyHotels);
router.get('/:id', validateObjectId, getHotel);
router.get('/:id/stats', validateObjectId, getHotelStats);

// Protected routes
router.use(protect);

// Manager and Admin routes
router.post('/', authorize('manager', 'admin'), validateHotel, createHotel);
router.put('/:id', authorize('manager', 'admin'), validateObjectId, validateHotel, updateHotel);
router.delete('/:id', authorize('manager', 'admin'), validateObjectId, deleteHotel);

// Image upload routes
router.post('/:id/images', authorize('manager', 'admin'), validateObjectId, upload.array('images', 10), uploadHotelImages);
router.delete('/:id/images/:imageId', authorize('manager', 'admin'), validateObjectId, deleteHotelImage);

export default router;