
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// Public: Get all posts (for homepage, no login needed)
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find({
      $or: [{ image: { $exists: false } }, { image: null }],
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// Create post (JSON only, no images)
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
    const post = await Post.create({ title, content, author: req.user.id });
    res.status(201).json(post);
  } catch (err) { next(err); }
});

// Get my posts (hide legacy image posts if any have leftover field)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const posts = await Post.find({
      author: req.user.id,
      $or: [{ image: { $exists: false } }, { image: null }]
    }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { next(err); }
});

// Like/unlike
router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user.id;
    const hasLiked = post.likes.some(id => String(id) === String(userId));
    if (hasLiked) {
      post.likes = post.likes.filter(id => String(id) !== String(userId));
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: !hasLiked });
  } catch (err) { next(err); }
});

// Update
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { $set: { title, content } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) { next(err); }
});

// Delete
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Add comment
router.post('/:id/comment', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!req.body.text?.trim()) return res.status(400).json({ message: 'Comment text required' });
    post.comments.push({ author: req.user.id, text: req.body.text.trim() });
    await post.save();
    res.json({ comments: post.comments });
  } catch (err) { next(err); }
});

module.exports = router;
