import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req, res, next) => {
  try {
    console.log('Received query params:', req.query);
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Filter by city
    if (req.query.city) {
      query['address.city'] = new RegExp(req.query.city, 'i');
    }

    // Filter by country
    if (req.query.country) {
      query['address.country'] = new RegExp(req.query.country, 'i');
    }

    // Filter by star rating
    if (req.query.starRating) {
      query.starRating = { $gte: parseInt(req.query.starRating) };
    }

    // Filter by average rating
    if (req.query.minRating) {
      query.averageRating = { $gte: parseFloat(req.query.minRating) };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query['priceRange.min'] = {};
      if (req.query.minPrice) {
        query['priceRange.min'].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query['priceRange.max'] = { $lte: parseFloat(req.query.maxPrice) };
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
      sort = '-averageRating -createdAt';
    }

    console.log('Final query:', JSON.stringify(query, null, 2));
    
    // Execute query
    const hotels = await Hotel.find(query)
      .populate('manager', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip(startIndex)
      .select('-__v');

    // Get total count for pagination
    const total = await Hotel.countDocuments(query);

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
      count: hotels.length,
      total,
      pagination,
      data: {
        hotels
      }
    });
  } catch (error) {
    logger.error('Get hotels error:', error);
    next(error);
  }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('manager', 'firstName lastName email phone')
      .populate({
        path: 'rooms',
        match: { isActive: true },
        select: 'roomNumber type capacity pricePerNight images amenities'
      });

    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found'
      });
    }

    // Get recent reviews
    const reviews = await Review.find({ 
      hotel: req.params.id, 
      status: 'approved' 
    })
      .populate('user', 'firstName lastName avatar')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        hotel,
        reviews
      }
    });
  } catch (error) {
    logger.error('Get hotel error:', error);
    next(error);
  }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Public (for testing)
export const createHotel = async (req, res, next) => {
  try {
    // For testing purposes, use a mock manager ID if no user is authenticated
    if (!req.user?.id) {
      // Create a valid ObjectId for testing
      const mongoose = await import('mongoose');
      req.body.manager = new mongoose.Types.ObjectId();
    } else {
      req.body.manager = req.user.id;
    }

    const hotel = await Hotel.create(req.body);

    logger.info(`Hotel created: ${hotel.name} by ${req.user?.email || 'anonymous'}`);

    res.status(201).json({
      status: 'success',
      data: {
        hotel
      }
    });
  } catch (error) {
    logger.error('Create hotel error:', error);
    next(error);
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Manager/Admin)
export const updateHotel = async (req, res, next) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

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
        message: 'Not authorized to update this hotel'
      });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    logger.info(`Hotel updated: ${hotel.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        hotel
      }
    });
  } catch (error) {
    logger.error('Update hotel error:', error);
    next(error);
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Manager/Admin)
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

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
        message: 'Not authorized to delete this hotel'
      });
    }

    // Soft delete - set isActive to false
    hotel.isActive = false;
    await hotel.save();

    // Also deactivate all rooms in this hotel
    await Room.updateMany(
      { hotel: req.params.id },
      { isActive: false }
    );

    logger.info(`Hotel deleted: ${hotel.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    logger.error('Delete hotel error:', error);
    next(error);
  }
};

// @desc    Upload hotel images
// @route   POST /api/hotels/:id/images
// @access  Private (Manager/Admin)
export const uploadHotelImages = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

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
        message: 'Not authorized to upload images for this hotel'
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
        folder: `hotels/${hotel._id}`,
        resource_type: 'image'
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const newImages = uploadResults.map((result, index) => ({
      public_id: result.public_id,
      url: result.secure_url,
      caption: req.body.captions ? req.body.captions[index] : ''
    }));

    hotel.images.push(...newImages);
    await hotel.save();

    logger.info(`Images uploaded for hotel: ${hotel.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        images: newImages
      }
    });
  } catch (error) {
    logger.error('Upload hotel images error:', error);
    next(error);
  }
};

// @desc    Delete hotel image
// @route   DELETE /api/hotels/:id/images/:imageId
// @access  Private (Manager/Admin)
export const deleteHotelImage = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

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
        message: 'Not authorized to delete images for this hotel'
      });
    }

    const imageIndex = hotel.images.findIndex(
      img => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Image not found'
      });
    }

    const image = hotel.images[imageIndex];

    // Delete from Cloudinary
    if (image.public_id) {
      await deleteFromCloudinary(image.public_id);
    }

    // Remove from hotel
    hotel.images.splice(imageIndex, 1);
    await hotel.save();

    logger.info(`Image deleted for hotel: ${hotel.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully'
    });
  } catch (error) {
    logger.error('Delete hotel image error:', error);
    next(error);
  }
};

// @desc    Get hotel statistics
// @route   GET /api/hotels/:id/stats
// @access  Public
export const getHotelStats = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found'
      });
    }

    // Get room statistics
    const roomStats = await Room.aggregate([
      { $match: { hotel: hotel._id, isActive: true } },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          averagePrice: { $avg: '$pricePerNight' },
          minPrice: { $min: '$pricePerNight' },
          maxPrice: { $max: '$pricePerNight' },
          roomTypes: { $addToSet: '$type' }
        }
      }
    ]);

    // Get review statistics
    const reviewStats = await Review.getHotelStats(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        hotel: {
          id: hotel._id,
          name: hotel.name,
          starRating: hotel.starRating
        },
        rooms: roomStats[0] || {
          totalRooms: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          roomTypes: []
        },
        reviews: reviewStats || {
          totalReviews: 0,
          averageRating: 0,
          ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }
    });
  } catch (error) {
    logger.error('Get hotel stats error:', error);
    next(error);
  }
};

// @desc    Search hotels
// @route   GET /api/hotels/search
// @access  Public
export const searchHotels = async (req, res, next) => {
  try {
    const { q, city, checkIn, checkOut, guests } = req.query;

    let query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Location search
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Find hotels
    let hotels = await Hotel.find(query)
      .populate('manager', 'firstName lastName')
      .select('-__v')
      .sort(q ? { score: { $meta: 'textScore' } } : '-averageRating');

    // If dates are provided, filter by room availability
    if (checkIn && checkOut && guests) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const guestCount = parseInt(guests);

      const availableHotels = [];

      for (const hotel of hotels) {
        const availableRooms = await Room.find({
          hotel: hotel._id,
          isActive: true,
          isAvailable: true,
          capacity: { $gte: guestCount }
        });

        let hasAvailableRoom = false;
        for (const room of availableRooms) {
          const isAvailable = await room.isAvailableForDates(checkInDate, checkOutDate);
          if (isAvailable) {
            hasAvailableRoom = true;
            break;
          }
        }

        if (hasAvailableRoom) {
          availableHotels.push(hotel);
        }
      }

      hotels = availableHotels;
    }

    res.status(200).json({
      status: 'success',
      count: hotels.length,
      data: {
        hotels
      }
    });
  } catch (error) {
    logger.error('Search hotels error:', error);
    next(error);
  }
};

// @desc    Get nearby hotels
// @route   GET /api/hotels/nearby
// @access  Public
export const getNearbyHotels = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius);

    const hotels = await Hotel.find({
      isActive: true,
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInKm * 1000 // Convert km to meters
        }
      }
    })
      .populate('manager', 'firstName lastName')
      .select('-__v')
      .limit(20);

    res.status(200).json({
      status: 'success',
      count: hotels.length,
      data: {
        hotels
      }
    });
  } catch (error) {
    logger.error('Get nearby hotels error:', error);
    next(error);
  }
};

// @desc    Upload authenticity certificate
// @route   POST /api/hotels/:id/authenticity-certificate
// @access  Public (for testing)
export const uploadAuthenticityCertificate = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found'
      });
    }

    // Skip authorization check for testing
    // if (hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     status: 'error',
    //     message: 'Not authorized to upload certificate for this hotel'
    //   });
    // }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No certificate file provided'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: `hotels/${hotel._id}/certificates`,
      resource_type: 'image'
    });

    // Update hotel with certificate
    hotel.authenticityCertificate = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      uploadedAt: new Date()
    };

    await hotel.save();

    logger.info(`Authenticity certificate uploaded for hotel: ${hotel.name} by ${req.user?.email || 'anonymous'}`);

    res.status(200).json({
      status: 'success',
      data: {
        certificate: hotel.authenticityCertificate
      }
    });
  } catch (error) {
    logger.error('Upload authenticity certificate error:', error);
    next(error);
  }
};

// @desc    Delete authenticity certificate
// @route   DELETE /api/hotels/:id/authenticity-certificate
// @access  Private (Manager/Admin)
export const deleteAuthenticityCertificate = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

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
        message: 'Not authorized to delete certificate for this hotel'
      });
    }

    if (!hotel.authenticityCertificate) {
      return res.status(404).json({
        status: 'error',
        message: 'No certificate found'
      });
    }

    // Delete from Cloudinary
    if (hotel.authenticityCertificate.public_id) {
      await deleteFromCloudinary(hotel.authenticityCertificate.public_id);
    }

    // Remove from hotel
    hotel.authenticityCertificate = undefined;
    await hotel.save();

    logger.info(`Authenticity certificate deleted for hotel: ${hotel.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    logger.error('Delete authenticity certificate error:', error);
    next(error);
  }
};