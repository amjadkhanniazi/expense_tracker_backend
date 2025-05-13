// routes/transactions.js
const express = require('express');
const router = express.Router();

const Transaction = require('../models/transaction');
const { protect } = require('../middlewares/auth');
const { transactionValidation, validate } = require('../middlewares/validators');
const { checkBudgetLimit } = require('../middlewares/budgetAlert');

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let query = Transaction.find({ user: req.user.id }).populate('category');
    
    // Filtering
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }
    
    if (req.query.type) {
      query = query.find({ type: req.query.type });
    }
    
    if (req.query.startDate && req.query.endDate) {
      query = query.find({
        date: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        }
      });
    }
    
    // Search by description
    if (req.query.search) {
      query = query.find({
        description: { $regex: req.query.search, $options: 'i' }
      });
    }
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-date');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Transaction.countDocuments({ user: req.user.id });
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const transactions = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('category');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', protect, transactionValidation, validate, checkBudgetLimit, async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    const transaction = await Transaction.create(req.body);
    
    const response = {
      success: true,
      data: transaction
    };
    
    // Add budget alert if applicable
    if (req.budgetAlert) {
      response.budgetAlert = req.budgetAlert;
    }
    
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', protect, transactionValidation, validate, checkBudgetLimit, async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this transaction'
      });
    }
    
    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    const response = {
      success: true,
      data: transaction
    };
    
    // Add budget alert if applicable
    if (req.budgetAlert) {
      response.budgetAlert = req.budgetAlert;
    }
    
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this transaction'
      });
    }
    
    await Transaction.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;