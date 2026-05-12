const express = require('express');
const router = express.Router();

const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');

const { protect } = require('../middlewares/authMiddleware');
const { bookValidation } = require('../validators/bookValidators');

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', protect, bookValidation, createBook);
router.put('/:id', protect, bookValidation, updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
