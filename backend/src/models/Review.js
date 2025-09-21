import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    cleanliness: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comfort: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    location: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    service: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    valueForMoney: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [200, 'Pro cannot exceed 200 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [200, 'Con cannot exceed 200 characters']
  }],
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  moderationNotes: String,
  response: {
    content: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  visitType: {
    type: String,
    enum: ['business', 'leisure', 'family', 'couple', 'solo', 'group'],
    default: 'leisure'
  },
  stayDate: Date,
  roomType: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating (if detailed ratings are provided)
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = [];
  if (this.rating.cleanliness) ratings.push(this.rating.cleanliness);
  if (this.rating.comfort) ratings.push(this.rating.comfort);
  if (this.rating.location) ratings.push(this.rating.location);
  if (this.rating.service) ratings.push(this.rating.service);
  if (this.rating.valueForMoney) ratings.push(this.rating.valueForMoney);
  
  if (ratings.length === 0) return this.rating.overall;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Compound index to prevent duplicate reviews per booking
reviewSchema.index({ user: 1, hotel: 1, booking: 1 }, { unique: true });

// Other indexes for better query performance
reviewSchema.index({ hotel: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ isVerified: 1, status: 1 });
reviewSchema.index({ helpfulVotes: -1 });

// Validate that user has actually stayed at the hotel (if booking is provided)
reviewSchema.pre('save', async function(next) {
  if (this.booking) {
    const Booking = mongoose.model('Booking');
    const booking = await Booking.findOne({
      _id: this.booking,
      user: this.user,
      hotel: this.hotel,
      status: 'checked-out'
    });
    
    if (!booking) {
      const error = new Error('You can only review hotels where you have completed a stay');
      error.statusCode = 400;
      return next(error);
    }
    
    // Set verified status and stay date
    this.isVerified = true;
    this.stayDate = booking.checkOutDate;
  }
  
  next();
});

// Update hotel average rating after review is saved
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    const Hotel = mongoose.model('Hotel');
    const hotel = await Hotel.findById(this.hotel);
    if (hotel) {
      await hotel.updateAverageRating();
    }
  }
});

// Update hotel average rating after review is updated
reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'approved') {
    const Hotel = mongoose.model('Hotel');
    const hotel = await Hotel.findById(doc.hotel);
    if (hotel) {
      await hotel.updateAverageRating();
    }
  }
});

// Update hotel average rating after review is deleted
reviewSchema.post('remove', async function() {
  const Hotel = mongoose.model('Hotel');
  const hotel = await Hotel.findById(this.hotel);
  if (hotel) {
    await hotel.updateAverageRating();
  }
});

// Methods
reviewSchema.methods.markHelpful = async function() {
  this.helpfulVotes += 1;
  await this.save();
};

reviewSchema.methods.report = async function() {
  this.reportCount += 1;
  
  // Auto-hide if too many reports
  if (this.reportCount >= 5) {
    this.status = 'hidden';
  }
  
  await this.save();
};

reviewSchema.methods.approve = async function() {
  this.status = 'approved';
  await this.save();
};

reviewSchema.methods.reject = async function(notes) {
  this.status = 'rejected';
  this.moderationNotes = notes;
  await this.save();
};

reviewSchema.methods.addResponse = async function(content, respondedBy) {
  this.response = {
    content,
    respondedBy,
    respondedAt: new Date()
  };
  await this.save();
};

// Static methods
reviewSchema.statics.getHotelStats = async function(hotelId) {
  const stats = await this.aggregate([
    {
      $match: { 
        hotel: mongoose.Types.ObjectId(hotelId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$hotel',
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating.overall' },
        averageCleanliness: { $avg: '$rating.cleanliness' },
        averageComfort: { $avg: '$rating.comfort' },
        averageLocation: { $avg: '$rating.location' },
        averageService: { $avg: '$rating.service' },
        averageValueForMoney: { $avg: '$rating.valueForMoney' },
        ratingDistribution: {
          $push: '$rating.overall'
        }
      }
    },
    {
      $addFields: {
        ratingCounts: {
          5: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 5] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          1: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 1] }
              }
            }
          }
        }
      }
    }
  ]);

  return stats[0] || null;
};

export default mongoose.model('Review', reviewSchema);