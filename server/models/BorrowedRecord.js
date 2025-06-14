
const mongoose = require('mongoose');

const BorrowedRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  borrowDate: {
    type: Date,
    default: Date.now,
  },
  returnDate: { // Can be used to mark when it was returned, or for due dates
    type: Date,
    default: null,
  }
}, { timestamps: true });

// Ensure virtual 'id' is included when converting to JSON
BorrowedRecordSchema.set('toJSON', {
    virtuals: true,
    versionKey:false,
    transform: function (doc, ret) { delete ret._id }
});

// Compound index to prevent a user from borrowing the same book multiple times if not returned
// This unique index applies if returnDate is null (meaning book is currently borrowed)
BorrowedRecordSchema.index({ userId: 1, bookId: 1, returnDate: 1}, { unique: true });


module.exports = mongoose.model('BorrowedRecord', BorrowedRecordSchema);
