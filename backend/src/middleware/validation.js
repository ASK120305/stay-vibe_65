import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Hotel validation rules
export const validateHotel = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('starRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Star rating must be between 1 and 5'),
  body('amenities')
    .isArray()
    .withMessage('Amenities must be an array'),
  handleValidationErrors
];

// Room validation rules
export const validateRoom = [
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required'),
  body('type')
    .isIn(['single', 'double', 'suite', 'deluxe', 'presidential'])
    .withMessage('Invalid room type'),
  body('capacity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Capacity must be between 1 and 10'),
  body('pricePerNight')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('amenities')
    .isArray()
    .withMessage('Amenities must be an array'),
  handleValidationErrors
];

// Booking validation rules
export const validateBooking = [
  body('hotel')
    .isMongoId()
    .withMessage('Invalid hotel ID'),
  body('room')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('checkInDate')
    .isISO8601()
    .toDate()
    .withMessage('Check-in date must be a valid date'),
  body('checkOutDate')
    .isISO8601()
    .toDate()
    .withMessage('Check-out date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('guests')
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of guests must be between 1 and 10'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters'),
  handleValidationErrors
];

// Review validation rules
export const validateReview = [
  body('hotel')
    .isMongoId()
    .withMessage('Invalid hotel ID'),
  body('booking')
    .optional()
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  handleValidationErrors
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];