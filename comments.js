// Create web server
// Create route
// Create a comment
// Create a comment
// Delete a comment
// Update a comment
// Get a comment
// Get all comments
// Get all comments for a specific post

// Create web server
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Models
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Comment text is required').not().isEmpty(),
      check('post', 'Post id is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return error
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get user
      const user = await User.findById(req.user.id).select('-password');

      // Create comment
      const comment = new Comment({
        text: req.body.text,
        user: req.user.id,
        post: req.body.post,
        name: user.name,
        avatar: user.avatar,
      });

      // Save comment
      await comment.save();

      // Return comment
      res.json(comment);
    } catch (err) {
      // Log error
      console.error(err.message);

      // Return error
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Get comment
    const comment = await Comment.findById(req.params.id);

    // Check if comment exists
    if (!comment) {
      // Return error
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user owns comment
    if (comment.user.toString() !== req.user.id) {
      // Return error
      return res.status(401).json({ msg: 'User not authorized' });
    }