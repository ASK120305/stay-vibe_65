import Review from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import logger from '../utils/logger.js';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { status: 'approved' };

    // Filter by hotel
    if (req.query.hotel) {
      query.hotel = req.query.hotel;
    }

    // Filter by rating
    if (req.query.minRating) {
      query['rating.overall'] = { $gte: parseInt(req.query.minRating) };
    }

    // Filter by verified reviews only
    if (req.query.verified === 'true') {
      query.isVerified = true;
    }

    // Sort options
    let sort = {};
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      sort = sortBy;
    } else {
      sort = '-createdAt';
    }

    // Execute query
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName avatar')
      .populate('hotel', 'name')
      .populate('booking', 'bookingReference checkOutDate')
      .sort(sort)
      .limit(limit * 1)
      .skip(startIndex)
      .select('-__v');

    // Get total count for pagination
    const total = await Review.countDocuments(query);

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
      count: reviews.length,
      total,
      pagination,
      data: {
        reviews
      }
    });
  } catch (error) {
    logger.error('Get reviews error:', error);
    next(error);
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'firstName lastName avatar')
      .populate('hotel', 'name address')
      .populate('booking', 'bookingReference checkOutDate')
      .populate('response.respondedBy', 'firstName lastName role');

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Only show approved reviews to public, unless user is the author or admin/manager
    if (review.status !== 'approved' && 
        (!req.user || 
         (req.user.id !== review.user._id.toString() && 
          !['admin', 'manager'].includes(req.user.role)))) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    logger.error('Get review error:', error);
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { hotel, booking, rating, title, comment, pros, cons, visitType, isAnonymous } = req.body;

    // Check if hotel exists
    const hotelDoc = await Hotel.findById(hotel);
    if (!hotelDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found'
      });
    }

    // If booking is provided, verify it belongs to the user and hotel
    if (booking) {
      const bookingDoc = await Booking.findOne({
        _id: booking,
        user: req.user.id,
        hotel: hotel,
        status: 'checked-out'
      });

      if (!bookingDoc) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid booking or you have not completed your stay'
        });
      }

      // Check if user has already reviewed this booking
      const existingReview = await Review.findOne({
        user: req.user.id,
        hotel: hotel,
        booking: booking
      });

      if (existingReview) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already reviewed this booking'
        });
      }
    } else {
      // Check if user has already reviewed this hotel without booking reference
      const existingReview = await Review.findOne({
        user: req.user.id,
        hotel: hotel,
        booking: { $exists: false }
      });

      if (existingReview) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already reviewed this hotel'
        });
      }
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      hotel,
      booking,
      rating,
      title,
      comment,
      pros,
      cons,
      visitType,
      isAnonymous,
      status: 'pending' // Reviews need approval
    });

    // Populate the review for response
    await review.populate([
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'hotel', select: 'name' },
      { path: 'booking', select: 'bookingReference' }
    ]);

    logger.info(`Review created for hotel ${hotelDoc.name} by ${req.user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully and is pending approval',
      data: {
        review
      }
    });
  } catch (error) {
    logger.error('Create review error:', error);
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this review'
      });
    }

    // Only allow updates to pending or rejected reviews
    if (!['pending', 'rejected'].includes(review.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update approved or hidden reviews'
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['rating', 'title', 'comment', 'pros', 'cons', 'visitType', 'isAnonymous'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Reset status to pending if it was rejected
    if (review.status === 'rejected') {
      updates.status = 'pending';
      updates.moderationNotes = undefined;
    }

    review = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'hotel', select: 'name' }
    ]);

    logger.info(`Review updated: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    logger.error('Update review error:', error);
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this review'
      });
    }

    await review.remove();

    logger.info(`Review deleted: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    logger.error('Delete review error:', error);
    next(error);
  }
};

// @desc    Get my reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute query
    const reviews = await Review.find({ user: req.user.id })
      .populate('hotel', 'name images')
      .populate('booking', 'bookingReference checkOutDate')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip(startIndex)
      .select('-__v');

    // Get total count for pagination
    const total = await Review.countDocuments({ user: req.user.id });

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
      count: reviews.length,
      total,
      pagination,
      data: {
        reviews
      }
    });
  } catch (error) {
    logger.error('Get my reviews error:', error);
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   PATCH /api/reviews/:id/helpful
// @access  Private
export const markReviewHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    if (review.status !== 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only mark approved reviews as helpful'
      });
    }

    // Prevent users from marking their own reviews as helpful
    if (review.user.toString() === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot mark your own review as helpful'
      });
    }

    await review.markHelpful();

    res.status(200).json({
      status: 'success',
      message: 'Review marked as helpful',
      data: {
        helpfulVotes: review.helpfulVotes
      }
    });
  } catch (error) {
    logger.error('Mark review helpful error:', error);
    next(error);
  }
};

// @desc    Report review
// @route   PATCH /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Prevent users from reporting their own reviews
    if (review.user.toString() === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot report your own review'
      });
    }

    await review.report();

    logger.info(`Review reported: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Review reported successfully'
    });
  } catch (error) {
    logger.error('Report review error:', error);
    next(error);
  }
};

// @desc    Approve review
// @route   PATCH /api/reviews/:id/approve
// @access  Private (Manager/Admin)
export const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if manager can approve this review
    if (req.user.role === 'manager') {
      const hotel = await Hotel.findById(review.hotel);
      if (hotel.manager.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to approve this review'
        });
      }
    }

    await review.approve();

    logger.info(`Review approved: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Review approved successfully'
    });
  } catch (error) {
    logger.error('Approve review error:', error);
    next(error);
  }
};

// @desc    Reject review
// @route   PATCH /api/reviews/:id/reject
// @access  Private (Manager/Admin)
export const rejectReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if manager can reject this review
    if (req.user.role === 'manager') {
      const hotel = await Hotel.findById(review.hotel);
      if (hotel.manager.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to reject this review'
        });
      }
    }

    await review.reject(req.body.reason);

    logger.info(`Review rejected: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Review rejected successfully'
    });
  } catch (error) {
    logger.error('Reject review error:', error);
    next(error);
  }
};

// @desc    Add hotel response to review
// @route   POST /api/reviews/:id/response
// @access  Private (Manager/Admin)
export const addHotelResponse = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if manager can respond to this review
    if (req.user.role === 'manager') {
      const hotel = await Hotel.findById(review.hotel);
      if (hotel.manager.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to respond to this review'
        });
      }
    }

    if (review.status !== 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only respond to approved reviews'
      });
    }

    if (review.response && review.response.content) {
      return res.status(400).json({
        status: 'error',
        message: 'Review already has a response'
      });
    }

    await review.addResponse(req.body.content, req.user.id);

    logger.info(`Response added to review: ${req.params.id} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Response added successfully',
      data: {
        response: review.response
      }
    });
  } catch (error) {
    logger.error('Add hotel response error:', error);
    next(error);
  }
};