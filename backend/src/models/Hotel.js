import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  website: {
    type: String,
    trim: true
  },
  starRating: {
    type: Number,
    required: [true, 'Star rating is required'],
    min: [1, 'Star rating must be at least 1'],
    max: [5, 'Star rating cannot exceed 5']
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
  policies: {
    checkIn: {
      type: String,
      default: '15:00'
    },
    checkOut: {
      type: String,
      default: '11:00'
    },
    cancellation: {
      type: String,
      default: 'Free cancellation up to 24 hours before check-in'
    },
    petPolicy: {
      type: String,
      default: 'Pets not allowed'
    },
    smokingPolicy: {
      type: String,
      default: 'No smoking'
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hotel manager is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  priceRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for rooms
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false
});

// Virtual populate for reviews
hotelSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false
});

// Virtual populate for bookings
hotelSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false
});

// Virtual for full address
hotelSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Indexes for better query performance
hotelSchema.index({ name: 'text', description: 'text' });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ 'address.country': 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ averageRating: -1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ 'address.coordinates': '2dsphere' });

// Update price range when rooms are added/updated
hotelSchema.methods.updatePriceRange = async function() {
  const Room = mongoose.model('Room');
  const rooms = await Room.find({ hotel: this._id, isActive: true });
  
  if (rooms.length > 0) {
    const prices = rooms.map(room => room.pricePerNight);
    this.priceRange.min = Math.min(...prices);
    this.priceRange.max = Math.max(...prices);
  } else {
    this.priceRange.min = 0;
    this.priceRange.max = 0;
  }
  
  await this.save();
};

// Update average rating
hotelSchema.methods.updateAverageRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { hotel: this._id }
    },
    {
      $group: {
        _id: '$hotel',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalReviews = stats[0].totalReviews;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }

  await this.save();
};

export default mongoose.model('Hotel', hotelSchema);