const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { authenticate, requireKYC } = require('../middleware/authMiddleware');
const { depositFunds,withdrawFromWallet,getWalletTransactions } = require('../controllers/walletController'); 
const { body, validationResult } = require('express-validator'); 
const mongoose = require('mongoose'); 


router.post(
  '/deposit',authenticate, requireKYC,
  [
 
    body('userId').isMongoId().withMessage('Invalid user ID.'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero.'),
    body('description').optional().isString().withMessage('Description must be a string.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, amount, description } = req.body;

    try {
      const result = await depositFunds(userId, parseFloat(amount), description || 'Deposit');
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
);





router.post('/withdraw', withdrawFromWallet);

router.get('/transactions/:userId', getWalletTransactions);

module.exports = router;


