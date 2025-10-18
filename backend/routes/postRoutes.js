const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// 🟢 Get comments for a specific post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('comments');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔵 Add a new comment to a post
router.post('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      author: req.body.author || 'Anonymous',
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
