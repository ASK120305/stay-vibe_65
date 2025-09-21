import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: {
      values: ['single', 'double', 'suite', 'deluxe', 'presidential'],
      message: 'Room type must be single, double, suite, deluxe, or presidential'
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  bedConfiguration: {
    singleBeds: {
      type: Number,
      default: 0
    },
    doubleBeds: {
      type: Number,
      default: 0
    },
    queenBeds: {
      type: Number,
      default: 0
    },
    kingBeds: {
      type: Number,
      default: 0
    },
    sofaBeds: {
      type: Number,
      default: 0
    }
  },
  size: {
    type: Number, // in square meters
    min: [10, 'Room size must be at least 10 square meters']
  },
  floor: {
    type: Number,
    min: [0, 'Floor cannot be negative']
  },
  view: {
    type: String,
    enum: ['city', 'ocean', 'mountain', 'garden', 'pool', 'courtyard', 'none'],
    default: 'none'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maintenanceSchedule: [{
    startDate: Date,
    endDate: Date,
    reason: String,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed'],
      default: 'scheduled'
    }
  }],
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  cleaningStatus: {
    type: String,
    enum: ['clean', 'dirty', 'out-of-order', 'maintenance'],
    default: 'clean'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for bookings
roomSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'room',
  justOne: false
});

// Virtual for total beds
roomSchema.virtual('totalBeds').get(function() {
  const { singleBeds, doubleBeds, queenBeds, kingBeds, sofaBeds } = this.bedConfiguration;
  return singleBeds + doubleBeds + queenBeds + kingBeds + sofaBeds;
});

// Compound index to ensure unique room numbers per hotel
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

// Other indexes for better query performance
roomSchema.index({ hotel: 1, type: 1 });
roomSchema.index({ hotel: 1, pricePerNight: 1 });
roomSchema.index({ hotel: 1, capacity: 1 });
roomSchema.index({ hotel: 1, isActive: 1, isAvailable: 1 });
roomSchema.index({ type: 1, pricePerNight: 1 });

// Check room availability for specific dates
roomSchema.methods.isAvailableForDates = async function(checkInDate, checkOutDate) {
  const Booking = mongoose.model('Booking');
  
  // Check if room is active and available
  if (!this.isActive || !this.isAvailable) {
    return false;
  }

  // Check for maintenance schedule conflicts
  const hasMaintenanceConflict = this.maintenanceSchedule.some(maintenance => {
    return maintenance.status !== 'completed' &&
           ((new Date(maintenance.startDate) <= new Date(checkOutDate)) &&
            (new Date(maintenance.endDate) >= new Date(checkInDate)));
  });

  if (hasMaintenanceConflict) {
    return false;
  }

  // Check for booking conflicts
  const conflictingBookings = await Booking.find({
    room: this._id,
    status: { $in: ['confirmed', 'checked-in'] },
    $or: [
      {
        checkInDate: { $lt: new Date(checkOutDate) },
        checkOutDate: { $gt: new Date(checkInDate) }
      }
    ]
  });

  return conflictingBookings.length === 0;
};

// Get available dates for the next N days
roomSchema.methods.getAvailableDates = async function(days = 30) {
  const Booking = mongoose.model('Booking');
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);

  // Get all bookings for this room in the date range
  const bookings = await Booking.find({
    room: this._id,
    status: { $in: ['confirmed', 'checked-in'] },
    checkInDate: { $lt: endDate },
    checkOutDate: { $gt: startDate }
  }).select('checkInDate checkOutDate');

  // Get maintenance schedules
  const maintenanceSchedules = this.maintenanceSchedule.filter(
    maintenance => maintenance.status !== 'completed' &&
                  new Date(maintenance.startDate) < endDate &&
                  new Date(maintenance.endDate) > startDate
  );

  const unavailableDates = [];
  
  // Add booking dates
  bookings.forEach(booking => {
    const current = new Date(booking.checkInDate);
    const end = new Date(booking.checkOutDate);
    
    while (current < end) {
      unavailableDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  // Add maintenance dates
  maintenanceSchedules.forEach(maintenance => {
    const current = new Date(maintenance.startDate);
    const end = new Date(maintenance.endDate);
    
    while (current <= end) {
      unavailableDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  return unavailableDates;
};

// Update hotel price range when room price changes
roomSchema.post('save', async function() {
  const Hotel = mongoose.model('Hotel');
  const hotel = await Hotel.findById(this.hotel);
  if (hotel) {
    await hotel.updatePriceRange();
  }
});

// Update hotel price range when room is deleted
roomSchema.post('remove', async function() {
  const Hotel = mongoose.model('Hotel');
  const hotel = await Hotel.findById(this.hotel);
  if (hotel) {
    await hotel.updatePriceRange();
  }
});

export default mongoose.model('Room', roomSchema);