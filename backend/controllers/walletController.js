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
    transactionId: new mongoose.Types.ObjectId(),
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


const withdrawFromWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;

   
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid input' });
    }


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

 
    if (user.wallet.balance < amount) {
      return res.status(400).json({ status: 'error', message: 'Insufficient wallet balance' });
    }

  
    user.wallet.balance -= amount;

  
    user.wallet.transactions.push({
      transactionId: new mongoose.Types.ObjectId(),
      type: 'withdrawal',
      amount: amount,
      balanceAfterTransaction: user.wallet.balance,
      userId: userId,
    });


    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Withdrawal successful',
      walletBalance: user.wallet.balance,
    });
  } catch (error) {
    console.error('Error during withdrawal:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


 const getWalletTransactions = async (req, res) => {
  try {
    const { userId } = req.params;


    const user = await User.findById(userId).select('wallet.transactions wallet.balance');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      walletBalance: user.wallet.balance,
      transactions: user.wallet.transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  depositFunds,withdrawFromWallet,getWalletTransactions
};
