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
  getNearbyHotels,
  uploadAuthenticityCertificate,
  deleteAuthenticityCertificate
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

// Hotel creation (temporarily public for testing)
router.post('/', createHotel);

// Protected routes
router.use(protect);
router.put('/:id', authorize('manager', 'admin'), validateObjectId, validateHotel, updateHotel);
router.delete('/:id', authorize('manager', 'admin'), validateObjectId, deleteHotel);

// Image upload routes
router.post('/:id/images', authorize('manager', 'admin'), validateObjectId, upload.array('images', 10), uploadHotelImages);
router.delete('/:id/images/:imageId', authorize('manager', 'admin'), validateObjectId, deleteHotelImage);

// Authenticity certificate routes
router.post('/:id/authenticity-certificate', validateObjectId, upload.single('certificate'), uploadAuthenticityCertificate);
router.delete('/:id/authenticity-certificate', authorize('manager', 'admin'), validateObjectId, deleteAuthenticityCertificate);

export default router;