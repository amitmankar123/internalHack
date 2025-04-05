
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Token = require('../models/Token');
const Reward = require('../models/Reward');

// @route   GET api/tokens/balance
// @desc    Get user's token balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      balance: user.tokens.balance,
      lifetime: user.tokens.lifetime
    });
  } catch (err) {
    console.error('Error fetching token balance:', err);
    res.status(500).json({ message: 'Error fetching token balance' });
  }
});

// @route   GET api/tokens/history
// @desc    Get user's token transaction history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Token.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching token history:', err);
    res.status(500).json({ message: 'Error fetching token history' });
  }
});

// @route   POST api/tokens/earn
// @desc    Award tokens to user (internal use)
// @access  Private
router.post('/earn', auth, async (req, res) => {
  try {
    const { amount, source, description } = req.body;
    
    if (!amount || !source || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create token transaction
    const newToken = new Token({
      user: req.user.id,
      amount,
      type: 'earned',
      source,
      description
    });
    
    await newToken.save();
    
    // Update user's token balance
    user.tokens.balance += amount;
    user.tokens.lifetime += amount;
    user.tokens.lastUpdated = new Date();
    
    await user.save();
    
    res.json({
      transaction: newToken,
      newBalance: user.tokens.balance
    });
  } catch (err) {
    console.error('Error awarding tokens:', err);
    res.status(500).json({ message: 'Error awarding tokens' });
  }
});

// @route   GET api/tokens/rewards
// @desc    Get available rewards
// @access  Private
router.get('/rewards', auth, async (req, res) => {
  try {
    const rewards = await Reward.find({ available: true });
    res.json(rewards);
  } catch (err) {
    console.error('Error fetching rewards:', err);
    res.status(500).json({ message: 'Error fetching rewards' });
  }
});

// @route   POST api/tokens/redeem
// @desc    Redeem tokens for a reward
// @access  Private
router.post('/redeem', auth, async (req, res) => {
  try {
    const { rewardId } = req.body;
    
    if (!rewardId) {
      return res.status(400).json({ message: 'Reward ID is required' });
    }
    
    const reward = await Reward.findById(rewardId);
    
    if (!reward || !reward.available) {
      return res.status(404).json({ message: 'Reward not found or unavailable' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (user.tokens.balance < reward.tokenCost) {
      return res.status(400).json({ message: 'Insufficient token balance' });
    }
    
    // Create token transaction for redemption
    const newToken = new Token({
      user: req.user.id,
      amount: reward.tokenCost,
      type: 'spent',
      source: 'redemption',
      description: `Redeemed for ${reward.title}`
    });
    
    await newToken.save();
    
    // Update user's token balance
    user.tokens.balance -= reward.tokenCost;
    user.tokens.lastUpdated = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      reward,
      newBalance: user.tokens.balance,
      message: `Successfully redeemed ${reward.title}`
    });
  } catch (err) {
    console.error('Error redeeming tokens:', err);
    res.status(500).json({ message: 'Error redeeming tokens' });
  }
});

// @route   POST api/tokens/connect-wallet
// @desc    Connect user's wallet address
// @access  Private
router.post('/connect-wallet', auth, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    // Update user's wallet information
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'wallet.address': address,
        'wallet.connected': true
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      wallet: user.wallet
    });
  } catch (err) {
    console.error('Error connecting wallet:', err);
    res.status(500).json({ message: 'Error connecting wallet' });
  }
});

module.exports = router;
