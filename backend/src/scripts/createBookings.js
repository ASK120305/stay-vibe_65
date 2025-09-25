import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stayvibe';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const createBookings = async () => {
  try {
    await connectDB();

    // Get existing users, hotels, and rooms
    const users = await User.find({ role: 'guest' });
    const hotels = await Hotel.find({ isActive: true });
    const rooms = await Room.find({ isActive: true });

    if (users.length === 0 || hotels.length === 0 || rooms.length === 0) {
      console.log('Need users, hotels, and rooms to create bookings');
      return;
    }

    console.log(`Found ${users.length} users, ${hotels.length} hotels, ${rooms.length} rooms`);

    // Create sample bookings
    const bookings = await Booking.create([
      {
        user: users[0]._id,
        hotel: hotels[0]._id,
        room: rooms[0]._id,
        checkInDate: new Date('2024-02-01'),
        checkOutDate: new Date('2024-02-03'),
        guests: {
          adults: 2,
          children: 0
        },
        guestDetails: {
          primaryGuest: {
            firstName: users[0].firstName,
            lastName: users[0].lastName,
            email: users[0].email,
            phone: users[0].phone || '+1234567890'
          }
        },
        pricing: {
          basePrice: rooms[0].pricePerNight,
          totalAmount: rooms[0].pricePerNight * 2,
          currency: 'USD'
        },
        payment: {
          method: 'credit_card',
          status: 'paid',
          transactionId: 'TXN001',
          paidAmount: rooms[0].pricePerNight * 2,
          paymentDate: new Date()
        },
        status: 'confirmed',
        bookingReference: 'BK001',
        specialRequests: 'Late check-in requested'
      },
      {
        user: users[1]._id,
        hotel: hotels[1]._id,
        room: rooms[3]._id,
        checkInDate: new Date('2024-02-15'),
        checkOutDate: new Date('2024-02-17'),
        guests: {
          adults: 2,
          children: 1
        },
        guestDetails: {
          primaryGuest: {
            firstName: users[1].firstName,
            lastName: users[1].lastName,
            email: users[1].email,
            phone: users[1].phone || '+1234567891'
          }
        },
        pricing: {
          basePrice: rooms[3].pricePerNight,
          totalAmount: rooms[3].pricePerNight * 2,
          currency: 'USD'
        },
        payment: {
          method: 'paypal',
          status: 'paid',
          transactionId: 'TXN002',
          paidAmount: rooms[3].pricePerNight * 2,
          paymentDate: new Date()
        },
        status: 'confirmed',
        bookingReference: 'BK002',
        specialRequests: 'High floor room preferred'
      },
      {
        user: users[0]._id,
        hotel: hotels[2]._id,
        room: rooms[6]._id,
        checkInDate: new Date('2024-03-01'),
        checkOutDate: new Date('2024-03-05'),
        guests: {
          adults: 4,
          children: 0
        },
        guestDetails: {
          primaryGuest: {
            firstName: users[0].firstName,
            lastName: users[0].lastName,
            email: users[0].email,
            phone: users[0].phone || '+1234567890'
          }
        },
        pricing: {
          basePrice: rooms[6].pricePerNight,
          totalAmount: rooms[6].pricePerNight * 4,
          currency: 'USD'
        },
        payment: {
          method: 'credit_card',
          status: 'paid',
          transactionId: 'TXN003',
          paidAmount: rooms[6].pricePerNight * 4,
          paymentDate: new Date()
        },
        status: 'confirmed',
        bookingReference: 'BK003',
        specialRequests: 'Anniversary celebration'
      }
    ]);

    console.log(`Created ${bookings.length} bookings successfully!`);
    
    // Display booking summary
    for (const booking of bookings) {
      const hotel = await Hotel.findById(booking.hotel);
      const room = await Room.findById(booking.room);
      console.log(`- ${booking.bookingReference}: ${hotel.name} (${room.type}) - ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()}`);
    }

  } catch (error) {
    console.error('Error creating bookings:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createBookings();
