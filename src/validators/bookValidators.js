const { body } = require('express-validator');

const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),

  body('author')
    .trim()
    .notEmpty().withMessage('Author name is required')
    .isLength({ min: 2 }).withMessage('Author name must be at least 2 characters'),

  body('isbn')
    .trim()
    .notEmpty().withMessage('ISBN is required')
    .isLength({ min: 10, max: 20 }).withMessage('ISBN must be between 10 and 20 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
];

module.exports = {
  bookValidation,
};
