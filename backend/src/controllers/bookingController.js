import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';
import { emitBookingStatusUpdate } from '../realtime/websocket.js';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Manager/Admin)
export const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by hotel (for managers)
    if (req.user.role === 'manager') {
      const hotels = await Hotel.find({ manager: req.user.id }).select('_id');
      const hotelIds = hotels.map(hotel => hotel._id);
      query.hotel = { $in: hotelIds };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by hotel
    if (req.query.hotel) {
      query.hotel = req.query.hotel;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.checkInDate = {};
      if (req.query.startDate) {
        query.checkInDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.checkInDate.$lte = new Date(req.query.endDate);
      }
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
    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('hotel', 'name address phone')
      .populate('room', 'roomNumber type')
      .sort(sort)
      .limit(limit * 1)
      .skip(startIndex)
      .select('-__v');

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

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
      count: bookings.length,
      total,
      pagination,
      data: {
        bookings
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('hotel', 'name address phone email')
      .populate('room', 'roomNumber type capacity amenities images');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role === 'guest' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this booking'
      });
    }

    // Check if manager can access this booking
    if (req.user.role === 'manager') {
      const hotel = await Hotel.findById(booking.hotel._id);
      if (hotel.manager.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to access this booking'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { hotel, room, checkInDate, checkOutDate, guests, guestDetails, specialRequests } = req.body;

    // Check if room exists and is available
    const roomDoc = await Room.findById(room).populate('hotel');
    if (!roomDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    // Check if room belongs to the specified hotel
    if (roomDoc.hotel._id.toString() !== hotel) {
      return res.status(400).json({
        status: 'error',
        message: 'Room does not belong to the specified hotel'
      });
    }

    // Check room availability
    const isAvailable = await roomDoc.isAvailableForDates(
      new Date(checkInDate),
      new Date(checkOutDate)
    );

    if (!isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Room is not available for the selected dates'
      });
    }

    // Check capacity
    const totalGuests = guests.adults + guests.children + guests.infants;
    if (totalGuests > roomDoc.capacity) {
      return res.status(400).json({
        status: 'error',
        message: 'Number of guests exceeds room capacity'
      });
    }

    // Calculate pricing
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const basePrice = roomDoc.pricePerNight * nights;
    const taxes = basePrice * 0.1; // 10% tax
    const fees = 25; // Service fee
    const totalAmount = basePrice + taxes + fees;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      hotel,
      room,
      checkInDate,
      checkOutDate,
      guests,
      guestDetails,
      specialRequests,
      pricing: {
        basePrice,
        taxes,
        fees,
        discounts: 0,
        totalAmount
      },
      payment: {
        method: 'pending',
        status: 'pending'
      }
    });

    // Populate the booking for response
    await booking.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'hotel', select: 'name address' },
      { path: 'room', select: 'roomNumber type' }
    ]);

    // Send confirmation email
    try {
      await sendEmail({
        email: guestDetails.primaryGuest.email,
        template: 'bookingConfirmation',
        data: {
          guestName: guestDetails.primaryGuest.firstName,
          bookingReference: booking.bookingReference,
          hotelName: roomDoc.hotel.name,
          roomType: roomDoc.type,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guests: `${guests.adults} Adults${guests.children > 0 ? `, ${guests.children} Children` : ''}`,
          totalAmount: totalAmount.toFixed(2)
        }
      });
    } catch (emailError) {
      logger.error('Booking confirmation email failed:', emailError);
      // Don't fail the booking if email fails
    }

    logger.info(`Booking created: ${booking.bookingReference} by ${req.user.email}`);

    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can update this booking
    if (req.user.role === 'guest' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this booking'
      });
    }

    // Check if booking can be modified
    if (!booking.canBeModified()) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking cannot be modified less than 48 hours before check-in'
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['guestDetails', 'specialRequests', 'guests'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'hotel', select: 'name address' },
      { path: 'room', select: 'roomNumber type' }
    ]);

    logger.info(`Booking updated: ${booking.bookingReference} by ${req.user.email}`);

    try {
      emitBookingStatusUpdate(booking.user.toString(), booking._id.toString(), booking.status, 'Your booking was updated');
    } catch (e) {
      logger.warn('Failed to emit booking update WS event');
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    logger.error('Update booking error:', error);
    next(error);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'name')
      .populate('room', 'type');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (req.user.role === 'guest' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking cannot be cancelled less than 24 hours before check-in'
      });
    }

    const refundAmount = await booking.cancel(req.user.id, req.body.reason);

    // Send cancellation email
    try {
      await sendEmail({
        email: booking.guestDetails.primaryGuest.email,
        template: 'bookingCancellation',
        data: {
          guestName: booking.guestDetails.primaryGuest.firstName,
          bookingReference: booking.bookingReference,
          hotelName: booking.hotel.name,
          checkInDate: booking.checkInDate.toDateString(),
          checkOutDate: booking.checkOutDate.toDateString(),
          refundAmount: refundAmount.toFixed(2)
        }
      });
    } catch (emailError) {
      logger.error('Cancellation email failed:', emailError);
    }

    logger.info(`Booking cancelled: ${booking.bookingReference} by ${req.user.email}`);

    try {
      emitBookingStatusUpdate(booking.user.toString(), booking._id.toString(), 'cancelled', 'Your booking was cancelled');
    } catch (e) {
      logger.warn('Failed to emit booking cancel WS event');
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: {
        refundAmount
      }
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    next(error);
  }
};

// @desc    Check in booking
// @route   PATCH /api/bookings/:id/check-in
// @access  Private (Manager/Admin)
export const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if manager can access this booking
    if (req.user.role === 'manager') {
      const hotel = await Hotel.findById(booking.hotel);
      if (hotel.manager.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to check in this booking'
        });
      }
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        status: 'error',
        message: 'Only confirmed bookings can be checked in'
      });
    }

    await booking.checkIn();

    logger.info(`Booking checked in: ${booking.bookingReference} by ${req.user.email}`);

    try {
      emitBookingStatusUpdate(booking.user.toString(), booking._id.toString(), 'checked-in', 'You have been checked in');
    } catch (e) {
      logger.warn('Failed to emit booking check-in WS event');
    }

    res.status(200).json({
      status: 'success',
      message: 'Guest checked in successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    logger.error('Check in booking error:', error);
    next(error);
  }
};

// @desc    Check out booking
// @route   PATCH /api/bookings/:id/check-out
// @access  Private (Manager/Admin)
export const checkOutBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if manager can access this booking
    if (req.user.role === 'manager') {
      const hotel = await Hotel.findById(booking.hotel);
      if (hotel.manager.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to check out this booking'
        });
      }
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({
        status: 'error',
        message: 'Only checked-in bookings can be checked out'
      });
    }

    await booking.checkOut();

    logger.info(`Booking checked out: ${booking.bookingReference} by ${req.user.email}`);

    try {
      emitBookingStatusUpdate(booking.user.toString(), booking._id.toString(), 'checked-out', 'You have been checked out');
    } catch (e) {
      logger.warn('Failed to emit booking check-out WS event');
    }

    res.status(200).json({
      status: 'success',
      message: 'Guest checked out successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    logger.error('Check out booking error:', error);
    next(error);
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { user: req.user.id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Execute query
    const bookings = await Booking.find(query)
      .populate('hotel', 'name address images')
      .populate('room', 'roomNumber type images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip(startIndex)
      .select('-__v');

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

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
      count: bookings.length,
      total,
      pagination,
      data: {
        bookings
      }
    });
  } catch (error) {
    logger.error('Get my bookings error:', error);
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats/overview
// @access  Private (Manager/Admin)
export const getBookingStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    // Filter by hotel for managers
    if (req.user.role === 'manager') {
      const hotels = await Hotel.find({ manager: req.user.id }).select('_id');
      const hotelIds = hotels.map(hotel => hotel._id);
      matchQuery.hotel = { $in: hotelIds };
    }

    // Overall statistics
    const overallStats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          averageBookingValue: { $avg: '$pricing.totalAmount' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
          }
        }
      }
    ]);

    // Monthly statistics for the last 12 months
    const monthlyStats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Status distribution
    const statusStats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overall: overallStats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          completedBookings: 0
        },
        monthly: monthlyStats,
        statusDistribution: statusStats
      }
    });
  } catch (error) {
    logger.error('Get booking stats error:', error);
    next(error);
  }
};