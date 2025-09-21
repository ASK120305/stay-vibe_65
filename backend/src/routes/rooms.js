import express from 'express';
import {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
  checkRoomAvailability,
  getRoomAvailability
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRoom, validateObjectId, validatePagination } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, getRooms);
router.get('/:id', validateObjectId, getRoom);
router.get('/:id/availability', validateObjectId, getRoomAvailability);
router.post('/:id/check-availability', validateObjectId, checkRoomAvailability);

// Protected routes
router.use(protect);

// Manager and Admin routes
router.post('/', authorize('manager', 'admin'), validateRoom, createRoom);
router.put('/:id', authorize('manager', 'admin'), validateObjectId, validateRoom, updateRoom);
router.delete('/:id', authorize('manager', 'admin'), validateObjectId, deleteRoom);

// Image upload routes
router.post('/:id/images', authorize('manager', 'admin'), validateObjectId, upload.array('images', 10), uploadRoomImages);
router.delete('/:id/images/:imageId', authorize('manager', 'admin'), validateObjectId, deleteRoomImage);

export default router;