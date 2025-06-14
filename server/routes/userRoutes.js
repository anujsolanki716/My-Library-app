
const express = require('express');
const router = express.Router();
const BorrowedRecord = require('../models/BorrowedRecord');
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get books borrowed by the current logged-in user
// @route   GET /api/users/me/borrowed-books
// @access  Private
router.get('/me/borrowed-books', protect, async (req, res) => {
  try {
    const borrowedRecords = await BorrowedRecord.find({ userId: req.user._id, returnDate: null })
      .populate('bookId'); // Populate book details

    // Transform data to match frontend expectations (Book with borrowDate)
    const borrowedBooksDetails = borrowedRecords.map(record => {
      if (!record.bookId) return null; // Should not happen if DB is consistent
      
      // Create a plain object from the Mongoose document for bookId
      const bookData = record.bookId.toObject({ virtuals: true });
      
      return {
        ...bookData, // Spread book details (id, title, author etc.)
        borrowDate: record.borrowDate.toISOString(),
      };
    }).filter(Boolean); // Remove any nulls if book population failed

    res.json(borrowedBooksDetails);
  } catch (error) {
    console.error("Get my borrowed books error:", error);
    res.status(500).json({ message: 'Server error fetching borrowed books', error: error.message });
  }
});

module.exports = router;
