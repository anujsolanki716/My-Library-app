
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  genre: {
    type: String,
    required: true,
    trim: true,
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0,
  },
  coverImageUrl: {
    type: String,
    trim: true,
    default: '', // Default to empty string or a placeholder image URL
  },
  // To easily get borrowed count without complex aggregation on every book list request
  borrowedCount: {
    type: Number,
    default: 0,
    min: 0,
  }
}, { timestamps: true });

// Ensure virtual 'id' is included when converting to JSON
BookSchema.set('toJSON', {
    virtuals: true,
    versionKey:false,
    transform: function (doc, ret) { delete ret._id }
});


module.exports = mongoose.model('Book', BookSchema);
