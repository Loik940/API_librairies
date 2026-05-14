const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Book = require('../models/Book');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isOwnerOrAdmin = (book, user) => {
  const ownerId = book.owner.toString();
  return ownerId === user.id || user.role === 'admin';
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Books fetched successfully',
      data: { books },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid identifier',
      });
    }

    const book = await Book.findById(id).populate('owner', 'name email role');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book fetched successfully',
      data: { book },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array(),
      });
    }

    const { title, author, isbn, description } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      description: description.trim(),
      owner: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'ISBN already in use',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array(),
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid identifier',
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    if (!isOwnerOrAdmin(book, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Action forbidden',
      });
    }

    const { title, author, isbn, description } = req.body;

    book.title = title.trim();
    book.author = author.trim();
    book.isbn = isbn.trim();
    book.description = description.trim();

    await book.save();

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: { book },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'ISBN already in use',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid identifier',
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    if (!isOwnerOrAdmin(book, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Action forbidden',
      });
    }

    await book.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: { book },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};

