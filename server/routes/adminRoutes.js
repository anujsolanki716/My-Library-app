
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const BorrowedRecord = require('../models/BorrowedRecord');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalBookTitles = await Book.countDocuments();
    const totalCopiesResult = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCopies' } } }
    ]);
    const totalCopiesInLibrary = totalCopiesResult.length > 0 ? totalCopiesResult[0].total : 0;

    const totalBorrowedBooks = await BorrowedRecord.countDocuments({ returnDate: null });
    
    // Calculate total available copies more accurately
    const booksWithBorrowed = await Book.find({});
    let totalAvailableCopies = 0;
    booksWithBorrowed.forEach(book => {
        totalAvailableCopies += (book.totalCopies - book.borrowedCount);
    });


    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });

    res.json({
      totalBookTitles,
      totalCopiesInLibrary,
      totalBorrowedBooks,
      totalAvailableCopies,
      totalUsers,
      totalAdmins,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: 'Server error fetching admin statistics', error: error.message });
  }
});

module.exports = router;
