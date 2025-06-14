
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const BorrowedRecord = require('../models/BorrowedRecord');
const { protect, admin } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// @desc    Fetch all books (public)
// @route   GET /api/books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) {
      query.genre = genre;
    }
    const books = await Book.find(query);
    // The 'borrowedCount' field on Book model should be updated by borrow/return operations.
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching books', error: error.message });
  }
});

// @desc    Fetch a single book by ID (public)
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid book ID format' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching book', error: error.message });
  }
});

// @desc    Add a new book (admin only)
// @route   POST /api/books
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { title, author, genre, totalCopies, coverImageUrl } = req.body;
  if (!title || !author || !genre || totalCopies === undefined) {
    return res.status(400).json({ message: 'Missing required fields for book' });
  }
  if (totalCopies < 0) {
    return res.status(400).json({ message: 'Total copies cannot be negative' });
  }

  try {
    const book = new Book({ title, author, genre, totalCopies, coverImageUrl });
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding book', error: error.message });
  }
});

// @desc    Update a book (admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { title, author, genre, totalCopies, coverImageUrl } = req.body;
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid book ID format' });
    }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if reducing totalCopies below currently borrowed count
    if (totalCopies !== undefined && totalCopies < book.borrowedCount) {
      return res.status(400).json({ message: `Cannot set total copies (${totalCopies}) less than currently borrowed copies (${book.borrowedCount}).` });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    if (totalCopies !== undefined) book.totalCopies = totalCopies;
    book.coverImageUrl = coverImageUrl !== undefined ? coverImageUrl : book.coverImageUrl;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating book', error: error.message });
  }
});

// @desc    Delete a book (admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid book ID format' });
    }
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.borrowedCount > 0) {
      return res.status(400).json({ message: 'Cannot delete book. It is currently borrowed by users.' });
    }
    await Book.deleteOne({ _id: req.params.id }); // Use deleteOne
    // Also delete any associated borrowed records (though the check above should prevent this if records exist)
    await BorrowedRecord.deleteMany({ bookId: req.params.id });
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting book', error: error.message });
  }
});


// --- Borrowing and Returning ---

// @desc    Borrow a book
// @route   POST /api/books/:bookId/borrow
// @access  Private (User)
router.post('/:bookId/borrow', protect, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book ID format' });
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already borrowed this book and hasn't returned it
    const existingRecord = await BorrowedRecord.findOne({ userId, bookId, returnDate: null });
    if (existingRecord) {
      return res.status(400).json({ message: 'You have already borrowed this book.' });
    }

    // Check availability (totalCopies vs borrowedCount)
    if (book.borrowedCount >= book.totalCopies) {
      return res.status(400).json({ message: 'No copies of this book are available.' });
    }

    // Create borrow record
    const borrowRecord = new BorrowedRecord({ userId, bookId });
    await borrowRecord.save();

    // Increment borrowedCount on the book
    book.borrowedCount += 1;
    await book.save();

    res.status(201).json({ message: 'Book borrowed successfully', borrowRecord });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error from compound index
        return res.status(400).json({ message: 'You have already borrowed this book (concurrent request protection).' });
    }
    console.error("Borrow book error:", error);
    res.status(500).json({ message: 'Server error borrowing book', error: error.message });
  }
});

// @desc    Return a book
// @route   POST /api/books/:bookId/return
// @access  Private (User)
router.post('/:bookId/return', protect, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book ID format' });
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found for return operation.' });
    }

    const borrowRecord = await BorrowedRecord.findOne({ userId, bookId, returnDate: null });
    if (!borrowRecord) {
      return res.status(400).json({ message: "You haven't borrowed this book or it was already returned." });
    }

    // Mark as returned (or delete the record, depending on tracking needs)
    // For this example, let's mark it by setting returnDate
    // If you prefer to delete: await BorrowedRecord.findByIdAndDelete(borrowRecord._id);
    borrowRecord.returnDate = new Date();
    await borrowRecord.save();


    // Decrement borrowedCount on the book, ensuring it doesn't go below 0
    if (book.borrowedCount > 0) {
      book.borrowedCount -= 1;
      await book.save();
    }

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    console.error("Return book error:", error);
    res.status(500).json({ message: 'Server error returning book', error: error.message });
  }
});


module.exports = router;
