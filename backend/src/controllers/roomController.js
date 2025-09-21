import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import logger from '../utils/logger.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Filter by hotel
    if (req.query.hotel) {
      query.hotel = req.query.hotel;
    }

    // Filter by room type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by capacity
    if (req.query.capacity) {
      query.capacity = { $gte: parseInt(req.query.capacity) };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.pricePerNight = {};
      if (req.query.minPrice) {
        query.pricePerNight.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.pricePerNight.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filter by amenities
    if (req.query.amenities) {
      const amenities = req.query.amenities.split(',');
      query.amenities = { $in: amenities };
    }

    // Sort options
    let sort = {};
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      sort = sortBy;
    } else {
      sort = 'pricePerNight';
    }

    // Execute query
    const rooms = await Room.find(query)
      .populate('hotel', 'name address starRating')
      .sort(sort)
      .limit(limit * 1)
      .skip(startIndex)
      .select('-__v');

    // Get total count for pagination
    const total = await Room.countDocuments(query);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      status: 'success',
      count: rooms.length,
      total,
      pagination,
      data: {
        rooms
      }
    });
  } catch (error) {
    logger.error('Get rooms error:', error);
    next(error);
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotel', 'name address phone email starRating amenities policies');

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        room
      }
    });
  } catch (error) {
    logger.error('Get room error:', error);
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Manager/Admin)
export const createRoom = async (req, res, next) => {
  try {
    // Check if hotel exists
    const hotel = await Hotel.findById(req.body.hotel);
    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found'
      });
    }

    // Check if user is the manager of this hotel or admin
    if (hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to create rooms for this hotel'
      });
    }

    const room = await Room.create(req.body);

    // Update hotel price range
    await hotel.updatePriceRange();

    logger.info(`Room created: ${room.roomNumber} in ${hotel.name} by ${req.user.email}`);

    res.status(201).json({
      status: 'success',
      data: {
        room
      }
    });
  } catch (error) {
    logger.error('Create room error:', error);
    next(error);
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Manager/Admin)
export const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Check if user is the manager of this hotel or admin
    if (room.hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this room'
      });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update hotel price range if price changed
    if (req.body.pricePerNight) {
      const hotel = await Hotel.findById(room.hotel);
      await hotel.updatePriceRange();
    }

    logger.info(`Room updated: ${room.roomNumber} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        room
      }
    });
  } catch (error) {
    logger.error('Update room error:', error);
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Manager/Admin)
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Check if user is the manager of this hotel or admin
    if (room.hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this room'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.find({
      room: req.params.id,
      status: { $in: ['confirmed', 'checked-in'] },
      checkOutDate: { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete room with active bookings'
      });
    }

    // Soft delete - set isActive to false
    room.isActive = false;
    await room.save();

    // Update hotel price range
    const hotel = await Hotel.findById(room.hotel);
    await hotel.updatePriceRange();

    logger.info(`Room deleted: ${room.roomNumber} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Room deleted successfully'
    });
  } catch (error) {
    logger.error('Delete room error:', error);
    next(error);
  }
};

// @desc    Upload room images
// @route   POST /api/rooms/:id/images
// @access  Private (Manager/Admin)
export const uploadRoomImages = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Check if user is the manager of this hotel or admin
    if (room.hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to upload images for this room'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No images provided'
      });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, {
        folder: `rooms/${room._id}`,
        resource_type: 'image'
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const newImages = uploadResults.map((result, index) => ({
      public_id: result.public_id,
      url: result.secure_url,
      caption: req.body.captions ? req.body.captions[index] : ''
    }));

    room.images.push(...newImages);
    await room.save();

    logger.info(`Images uploaded for room: ${room.roomNumber} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        images: newImages
      }
    });
  } catch (error) {
    logger.error('Upload room images error:', error);
    next(error);
  }
};

// @desc    Delete room image
// @route   DELETE /api/rooms/:id/images/:imageId
// @access  Private (Manager/Admin)
export const deleteRoomImage = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Check if user is the manager of this hotel or admin
    if (room.hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete images for this room'
      });
    }

    const imageIndex = room.images.findIndex(
      img => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Image not found'
      });
    }

    const image = room.images[imageIndex];

    // Delete from Cloudinary
    if (image.public_id) {
      await deleteFromCloudinary(image.public_id);
    }

    // Remove from room
    room.images.splice(imageIndex, 1);
    await room.save();

    logger.info(`Image deleted for room: ${room.roomNumber} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully'
    });
  } catch (error) {
    logger.error('Delete room image error:', error);
    next(error);
  }
};

// @desc    Check room availability
// @route   POST /api/rooms/:id/check-availability
// @access  Public
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate } = req.body;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Check-in and check-out dates are required'
      });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    const isAvailable = await room.isAvailableForDates(
      new Date(checkInDate),
      new Date(checkOutDate)
    );

    res.status(200).json({
      status: 'success',
      data: {
        available: isAvailable,
        room: {
          id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          pricePerNight: room.pricePerNight
        }
      }
    });
  } catch (error) {
    logger.error('Check room availability error:', error);
    next(error);
  }
};

// @desc    Get room availability calendar
// @route   GET /api/rooms/:id/availability
// @access  Public
export const getRoomAvailability = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    const unavailableDates = await room.getAvailableDates(days);

    res.status(200).json({
      status: 'success',
      data: {
        room: {
          id: room._id,
          roomNumber: room.roomNumber,
          type: room.type
        },
        unavailableDates,
        period: {
          from: new Date(),
          to: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          days
        }
      }
    });
  } catch (error) {
    logger.error('Get room availability error:', error);
    next(error);
  }
};