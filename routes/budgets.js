// routes/budgets.js
const express = require('express');
const router = express.Router();

const Budget = require('../models/budget');
const Transaction = require('../models/transaction');
const { protect } = require('../middlewares/auth');
const { budgetValidation, validate } = require('../middlewares/validators');

// @desc    Get all budgets for logged in user
// @route   GET /api/budgets
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    // Filter by month and year if provided
    const filter = { user: req.user.id };

    
    if (req.query.month) {
      filter.month = parseInt(req.query.month);
    }
    
    if (req.query.year) {
      filter.year = parseInt(req.query.year);
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    const budgets = await Budget.find(filter).populate('category');
    
    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('category');
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    
    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this budget'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
router.post('/', protect, budgetValidation, validate, async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Check if budget already exists for this category, month and year
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category: req.body.category,
      month: req.body.month,
      year: req.body.year
    });
    
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: 'Budget for this category and period already exists'
      });
    }
    
    const budget = await Budget.create(req.body);
    
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
router.put('/:id', protect, budgetValidation, validate, async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    
    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this budget'
      });
    }
    // to only change amount
    if (req.body.amount) {
      budget.amount = req.body.amount;
    }
    // to only change category
    if (req.body.category && req.body.category !== budget.category) {
      budget.category = req.body.category;
    }
    // to only change month
    if (req.body.month && req.body.month !== budget.month) {
      budget.month = req.body.month;
    }
    // to only change year
    if (req.body.year && req.body.year !== budget.year) {
      budget.year = req.body.year;
    }
    // If changing month/year/category, check if no duplicate will be created
    if (
      (req.body.month && req.body.month !== budget.month) ||
      (req.body.year && req.body.year !== budget.year) ||
      (req.body.category && req.body.category.toString() !== budget.category.toString())
    ) {
      const existingBudget = await Budget.findOne({
        user: req.user.id,
        amount: req.body.amount,
        _id: { $ne: req.params.id }
      });
      
      if (existingBudget) {
        return res.status(400).json({
          success: false,
          error: 'Budget for this category and period already exists'
        });
      }
    }
    
    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    
    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this budget'
      });
    }

    await Budget.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get budget status with spending details
// @route   GET /api/budgets/status/:month/:year
// @access  Private
router.get('/status/:month/:year', protect, async (req, res, next) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    
    // Get all budgets for the specified month and year
    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year
    }).populate('category');
    
    // Get the start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get all transactions for the month
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    }).populate('category');
    
    // Calculate spending for each budget category
    const budgetStatus = budgets.map(budget => {
      const categoryTransactions = transactions.filter(
        transaction => transaction.category._id.toString() === budget.category._id.toString()
      );
      
      const spent = categoryTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
      );
      
      const remaining = budget.amount - spent;
      const percentUsed = (spent / budget.amount) * 100;
      
      return {
        budget: {
          _id: budget._id,
          category: budget.category,
          amount: budget.amount,
          month: budget.month,
          year: budget.year
        },
        spent,
        remaining,
        percentUsed,
        status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'good',
        transactions: categoryTransactions
      };
    });
    
    res.status(200).json({
      success: true,
      count: budgetStatus.length,
      data: budgetStatus
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get monthly spending vs budget summary
// @route   GET /api/budgets/summary/:year
// @access  Private
router.get('/summary/:year', protect, async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    
    // Get all budgets for the specified year
    const budgets = await Budget.find({
      user: req.user.id,
      year
    }).populate('category');
    
    // Get all transactions for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    }).populate('category');
    
    // Create monthly summary
    const monthlySummary = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);
      
      // Filter transactions for this month
      const monthTransactions = transactions.filter(
        transaction => 
          transaction.date >= monthStart && 
          transaction.date <= monthEnd
      );
      
      // Filter budgets for this month
      const monthBudgets = budgets.filter(
        budget => budget.month === month
      );
      
      // Calculate total budgeted and spent
      const totalBudgeted = monthBudgets.reduce(
        (sum, budget) => sum + budget.amount, 
        0
      );
      
      const totalSpent = monthTransactions.reduce(
        (sum, transaction) => sum + transaction.amount, 
        0
      );
      
      monthlySummary.push({
        month,
        year,
        totalBudgeted,
        totalSpent,
        difference: totalBudgeted - totalSpent,
        percentUsed: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
      });
    }
    
    res.status(200).json({
      success: true,
      data: monthlySummary
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;