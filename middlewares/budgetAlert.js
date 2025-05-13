// middleware/budgetAlert.js
const Transaction = require('../models/transaction');
const Budget = require('../models/budget');

// Middleware to check if transaction exceeds budget
exports.checkBudgetLimit = async (req, res, next) => {
  try {
    if (req.body.type === 'expense') {
      const date = req.body.date ? new Date(req.body.date) : new Date();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const year = date.getFullYear();
      
      // Find budget for this category, month and year
      const budget = await Budget.findOne({
        user: req.user.id,
        category: req.body.category,
        month,
        year
      });
      
      if (budget) {
        // Sum all expenses for this category, month and year
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const transactions = await Transaction.find({
          user: req.user.id,
          category: req.body.category,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });
        
        let totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        totalSpent += parseFloat(req.body.amount);
        
        // Check if over budget
        if (totalSpent > budget.amount) {
          req.budgetAlert = {
            message: `This transaction exceeds your budget for this category. Budget: $${budget.amount}, Total spent: $${totalSpent}`,
            isOverBudget: true
          };
        } else if (totalSpent > budget.amount * 0.8) {
          // Alert when reaching 80% of budget
          req.budgetAlert = {
            message: `You've used ${Math.round((totalSpent / budget.amount) * 100)}% of your budget for this category.`,
            isOverBudget: false
          };
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};