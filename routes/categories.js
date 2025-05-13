
// routes/categories.js
const express = require('express');
const router = express.Router();

const Category = require('../models/category');
const { protect } = require('../middlewares/auth');

// @desc    Get all categories for logged in user
// @route   GET /api/categories
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [
        { user: req.user.id },
        { isDefault: true }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Make sure user owns category or category is default
    if (category.user.toString() !== req.user.id && !category.isDefault) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this category'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    // Custom categories are not default
    req.body.isDefault = false;
    
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Make sure user owns category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this category'
      });
    }
    
    // Prevent changing isDefault status
    if (req.body.isDefault !== undefined) {
      delete req.body.isDefault;
    }
    
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Make sure user owns category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this category'
      });
    }
    
    // Prevent deleting default categories
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete default categories'
      });
    }
    
    await Category.deleteOne({ _id: category._id });

    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;