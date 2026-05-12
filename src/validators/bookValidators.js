const { body } = require('express-validator');

const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ min: 2 }).withMessage('Le titre doit contenir au moins 2 caracteres'),

  body('author')
    .trim()
    .notEmpty().withMessage('Le nom de l auteur est obligatoire')
    .isLength({ min: 2 }).withMessage('Le nom de l auteur doit contenir au moins 2 caracteres'),

  body('isbn')
    .trim()
    .notEmpty().withMessage('L ISBN est obligatoire')
    .isLength({ min: 10, max: 20 }).withMessage('L ISBN doit contenir entre 10 et 20 caracteres'),

  body('description')
    .trim()
    .notEmpty().withMessage('La description est obligatoire')
    .isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caracteres'),
];

module.exports = {
  bookValidation,
};
