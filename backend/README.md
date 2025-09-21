# Stay Vibe Plan - Backend API

A comprehensive hotel booking system backend built with Node.js, Express, and MongoDB.

## Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Guest, Manager, Admin)
- Email verification and password reset
- Secure password hashing with bcrypt

### Hotel Management
- CRUD operations for hotels
- Image upload with Cloudinary integration
- Search and filtering capabilities
- Geolocation-based nearby hotel search
- Hotel statistics and analytics

### Room Management
- CRUD operations for rooms
- Room availability checking
- Price management and capacity control
- Room image uploads
- Maintenance scheduling

### Booking System
- Complete booking lifecycle management
- Real-time availability checking
- Automatic pricing calculation
- Booking modifications and cancellations
- Check-in/check-out functionality
- Email notifications

### Review & Rating System
- User reviews with detailed ratings
- Review moderation and approval
- Hotel response to reviews
- Helpful votes and reporting
- Verified reviews for completed stays

### Additional Features
- Global error handling and logging
- Input validation and sanitization
- Rate limiting and security middleware
- File upload handling
- Email notifications
- Comprehensive API documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Logging**: Winston
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── hotelController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   └── reviewController.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js             # Authentication middleware
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── upload.js           # File upload middleware
│   │   └── validation.js       # Input validation
│   ├── models/                 # Mongoose models
│   │   ├── User.js
│   │   ├── Hotel.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── hotels.js
│   │   ├── rooms.js
│   │   ├── bookings.js
│   │   └── reviews.js
│   ├── utils/                  # Utility functions
│   │   ├── logger.js           # Winston logger
│   │   ├── email.js            # Email service
│   │   └── cloudinary.js       # Image upload service
│   └── server.js               # Main server file
├── logs/                       # Log files
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/stay-vibe-plan
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Hotels
- `GET /api/hotels` - Get all hotels (with filtering)
- `GET /api/hotels/:id` - Get single hotel
- `POST /api/hotels` - Create hotel (Manager/Admin)
- `PUT /api/hotels/:id` - Update hotel (Manager/Admin)
- `DELETE /api/hotels/:id` - Delete hotel (Manager/Admin)
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/nearby` - Get nearby hotels

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create room (Manager/Admin)
- `PUT /api/rooms/:id` - Update room (Manager/Admin)
- `DELETE /api/rooms/:id` - Delete room (Manager/Admin)
- `GET /api/rooms/:id/availability` - Check room availability

### Bookings
- `GET /api/bookings` - Get all bookings (Manager/Admin)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/check-in` - Check-in (Manager/Admin)
- `PATCH /api/bookings/:id/check-out` - Check-out (Manager/Admin)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/my-reviews` - Get user's reviews
- `PATCH /api/reviews/:id/approve` - Approve review (Manager/Admin)
- `PATCH /api/reviews/:id/reject` - Reject review (Manager/Admin)

## User Roles

### Guest
- Register/login/logout
- Browse hotels and rooms
- Make bookings
- Manage their bookings
- Write reviews for completed stays
- Update profile

### Manager
- All guest permissions
- Manage their hotels
- Manage rooms for their hotels
- View bookings for their hotels
- Check-in/check-out guests
- Moderate reviews for their hotels
- View hotel statistics

### Admin
- All manager permissions
- Manage all hotels
- Manage all users
- Access all bookings
- System-wide statistics

## Security Features

- Password hashing with bcrypt
- JWT authentication with refresh tokens
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet for security headers
- File upload restrictions
- SQL injection prevention
- XSS protection

## Error Handling

- Global error handling middleware
- Structured error responses
- Comprehensive logging with Winston
- Environment-specific error details
- Graceful error recovery

## Logging

- Winston logger with multiple transports
- Separate error and combined logs
- Console logging in development
- Log rotation and size limits
- Structured logging format

## Email Notifications

- Welcome emails for new users
- Email verification
- Password reset emails
- Booking confirmations
- Booking cancellation notifications
- Responsive email templates

## File Upload

- Cloudinary integration for image storage
- Multiple file upload support
- File type and size validation
- Automatic image optimization
- Secure file handling

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Database Seeding

You can create seed data for development:

```javascript
// Example: Create admin user
const admin = await User.create({
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@stayvibe.com',
  password: 'Admin123!',
  role: 'admin',
  isEmailVerified: true
});
```

## Deployment

1. Set environment variables for production
2. Ensure MongoDB is accessible
3. Configure Cloudinary for image uploads
4. Set up email service (Gmail/SendGrid)
5. Deploy to your preferred platform (Heroku, AWS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.