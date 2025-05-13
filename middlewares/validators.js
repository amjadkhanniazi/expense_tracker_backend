// middleware/validators.js
const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
exports.registerValidation = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

exports.loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Transaction validation rules
exports.transactionValidation = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
];

// Budget validation rules
exports.budgetValidation = [
  body('amount')
  .optional()
  .isNumeric().withMessage('Amount must be a number'),
  
body('month')
  .optional()
  .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),

body('year')
  .optional()
  .isInt({ min: 2000 }).withMessage('Year must be valid'),

body('category')
  .optional()
  .notEmpty().withMessage('Category is required')
];