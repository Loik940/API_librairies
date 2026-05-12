const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('L adresse email est obligatoire')
    .isEmail().withMessage('Veuillez fournir une adresse email valide')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caracteres'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L adresse email est obligatoire')
    .isEmail().withMessage('Veuillez fournir une adresse email valide')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire'),
];

module.exports = {
  registerValidation,
  loginValidation,
};
