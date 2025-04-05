
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Community = require('../models/Community');

// @route   GET api/community
// @desc    Get all community groups
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Community.find()
      .sort({ createdAt: -1 })
      .populate('members', 'name');
    
    res.json(groups);
  } catch (err) {
    console.error('Error fetching community groups:', err);
    res.status(500).json({ message: 'Error fetching community groups' });
  }
});

// @route   POST api/community
// @desc    Create a new community group
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    // Create new group
    const newGroup = new Community({
      name,
      description,
      category,
      members: [req.user.id]
    });
    
    const group = await newGroup.save();
    
    res.json(group);
  } catch (err) {
    console.error('Error creating community group:', err);
    res.status(500).json({ message: 'Error creating community group' });
  }
});

// @route   POST api/community/:id/join
// @desc    Join a community group
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Community.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is already a member
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }
    
    // Add user to members
    group.members.push(req.user.id);
    await group.save();
    
    res.json(group);
  } catch (err) {
    console.error('Error joining community group:', err);
    res.status(500).json({ message: 'Error joining community group' });
  }
});

// @route   POST api/community/:id/leave
// @desc    Leave a community group
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Community.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }
    
    // Remove user from members
    group.members = group.members.filter(
      member => member.toString() !== req.user.id.toString()
    );
    
    await group.save();
    
    res.json(group);
  } catch (err) {
    console.error('Error leaving community group:', err);
    res.status(500).json({ message: 'Error leaving community group' });
  }
});

// @route   POST api/community/:id/message
// @desc    Post a message to a community group
// @access  Private
router.post('/:id/message', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const group = await Community.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.members.some(member => member.toString() === req.user.id.toString())) {
      return res.status(403).json({ message: 'Must be a member to post messages' });
    }
    
    // Add message
    group.messages.push({
      user: req.user.id,
      content
    });
    
    await group.save();
    
    // Return the newly added message
    const newMessage = group.messages[group.messages.length - 1];
    
    res.json(newMessage);
  } catch (err) {
    console.error('Error posting message:', err);
    res.status(500).json({ message: 'Error posting message' });
  }
});

// @route   GET api/community/:id/messages
// @desc    Get messages from a community group
// @access  Private
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const group = await Community.findById(req.params.id)
      .populate({
        path: 'messages.user',
        select: 'name'
      });
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group.messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

module.exports = router;
