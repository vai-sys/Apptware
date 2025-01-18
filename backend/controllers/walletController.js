const mongoose = require('mongoose'); 
const User = require('../models/User');

const depositFunds = async (userId, amount, description) => {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than zero.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const wallet = user.wallet;
  if (!wallet) {
    throw new Error('Wallet not found for the user.');
  }

  wallet.balance += amount;

  const transaction = {
    transactionId: new mongoose.Types.ObjectId(), // Use `new` here
    type: 'deposit',
    amount,
    balanceAfterTransaction: wallet.balance,
    description,
    date: new Date(),
  };

  wallet.transactions.push(transaction);

  await user.save();

  return {
    message: 'Funds deposited successfully.',
    wallet,
    transaction,
  };
};

module.exports = {
  depositFunds,
};
