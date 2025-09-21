import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required']
  },
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkInDate;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'At least one adult is required']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Number of children cannot be negative']
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, 'Number of infants cannot be negative']
    }
  },
  guestDetails: {
    primaryGuest: {
      firstName: {
        type: String,
        required: [true, 'Primary guest first name is required'],
        trim: true
      },
      lastName: {
        type: String,
        required: [true, 'Primary guest last name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Primary guest email is required'],
        lowercase: true
      },
      phone: {
        type: String,
        required: [true, 'Primary guest phone is required'],
        trim: true
      }
    },
    additionalGuests: [{
      firstName: String,
      lastName: String,
      age: Number
    }]
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative']
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, 'Taxes cannot be negative']
    },
    fees: {
      type: Number,
      default: 0,
      min: [0, 'Fees cannot be negative']
    },
    discounts: {
      type: Number,
      default: 0,
      min: [0, 'Discounts cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'refunded', 'failed'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative']
    },
    paymentDate: Date,
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    refundDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  bookingReference: {
    type: String,
    unique: true,
    required: [true, 'Booking reference is required']
  },
  checkInTime: Date,
  checkOutTime: Date,
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: Number
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total guests
bookingSchema.virtual('totalGuests').get(function() {
  return this.guests.adults + this.guests.children + this.guests.infants;
});

// Virtual for number of nights
bookingSchema.virtual('numberOfNights').get(function() {
  const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for booking duration in days
bookingSchema.virtual('duration').get(function() {
  return this.numberOfNights;
});

// Virtual populate for reviews
bookingSchema.virtual('review', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'booking',
  justOne: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ hotel: 1, status: 1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1, checkInDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Generate unique booking reference before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    let reference;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate reference: SVP + timestamp + random 4 digits
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(1000 + Math.random() * 9000);
      reference = `SVP${timestamp}${random}`;
      
      // Check if reference already exists
      const existingBooking = await mongoose.model('Booking').findOne({ bookingReference: reference });
      if (!existingBooking) {
        isUnique = true;
      }
    }
    
    this.bookingReference = reference;
  }
  next();
});

// Calculate total amount before saving
bookingSchema.pre('save', function(next) {
  if (this.isModified('pricing')) {
    this.pricing.totalAmount = this.pricing.basePrice + this.pricing.taxes + this.pricing.fees - this.pricing.discounts;
  }
  next();
});

// Methods
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const checkIn = new Date(this.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
  
  // Can cancel if more than 24 hours before check-in and status allows
  return hoursUntilCheckIn > 24 && ['pending', 'confirmed'].includes(this.status);
};

bookingSchema.methods.canBeModified = function() {
  const now = new Date();
  const checkIn = new Date(this.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
  
  // Can modify if more than 48 hours before check-in and status allows
  return hoursUntilCheckIn > 48 && ['pending', 'confirmed'].includes(this.status);
};

bookingSchema.methods.calculateRefundAmount = function() {
  const now = new Date();
  const checkIn = new Date(this.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
  
  let refundPercentage = 0;
  
  if (hoursUntilCheckIn > 48) {
    refundPercentage = 1.0; // 100% refund
  } else if (hoursUntilCheckIn > 24) {
    refundPercentage = 0.5; // 50% refund
  } else {
    refundPercentage = 0; // No refund
  }
  
  return this.pricing.totalAmount * refundPercentage;
};

bookingSchema.methods.checkIn = async function() {
  this.status = 'checked-in';
  this.checkInTime = new Date();
  await this.save();
};

bookingSchema.methods.checkOut = async function() {
  this.status = 'checked-out';
  this.checkOutTime = new Date();
  await this.save();
};

bookingSchema.methods.cancel = async function(cancelledBy, reason) {
  const refundAmount = this.calculateRefundAmount();
  
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    reason,
    refundAmount
  };
  
  await this.save();
  return refundAmount;
};

export default mongoose.model('Booking', bookingSchema);