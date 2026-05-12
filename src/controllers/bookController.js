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
      message: 'Tous les livres sont récupérer avec succes',
      data: { books },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant invalide',
      });
    }

    const book = await Book.findById(id).populate('owner', 'name email role');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre introuvable',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Livre recupere avec succes',
      data: { book },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'La validation a echoue',
        data: errors.array(),
      });
    }

    const { title, author, isbn, description } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentifiez ou connecter vous',
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
      message: 'Livre cree avec succes',
      data: { book },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'ISBN deja utilise',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'La validation a echoue',
        data: errors.array(),
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant invalide',
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre introuvable',
      });
    }

    if (!isOwnerOrAdmin(book, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Action interdite',
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
      message: 'Livre mis a jour avec succes',
      data: { book },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'cet isbn est utlisé',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant invalide',
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre introuvable',
      });
    }

    if (!isOwnerOrAdmin(book, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Action interdite',
      });
    }

    await book.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Livre supprime avec succes',
      data: { book },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
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
